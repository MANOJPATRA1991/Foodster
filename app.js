
var map;

// Create a blank array for listing all the markers
var markers = [];


// This global polygon variable is to ensure only ONE polgon is rendered
var polygon = null;

function initMap() {

  // Create a styles array to use with the map.
  var styledMapType = new google.maps.StyledMapType([
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ],
        {name: 'Styled Map'});

  // Constructor creates a new map - only center and zoom are required
  map = new google.maps.Map(document.getElementById('map'), {
    // LatLng literal
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'styled_map']
          }
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
  ];

  var largeInfowindow = new google.maps.InfoWindow();

  // Initialize the drawing manager
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');
  
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function(){
     populateInfoWindow(this, largeInfowindow);
    });
    marker.addListener('mouseover', function(){
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function(){
      this.setIcon(defaultIcon);
    });
  }

  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);
  
  document.getElementById('toggle-drawing').addEventListener('click', function(){
    toggleDrawing(drawingManager);
  });

  document.getElementById('zoom-to-area').addEventListener('click', function(){
    zoomToArea();
  });

  document.getElementById('search-within-time').addEventListener('click', function(){
    searchWithinTime();
  });

  // Add an event listener, so that the polygon is created, call the
  // searchWithPolygon function. This will show the markers in the polygon,
  // and hide any outside of it.
  drawingManager.addListener('overlaycomplete', function(event){
    if(polygon){
      polygon.setMap(null);
      hideListings();
    }

    //Switching the drawing mode to NULL
    drawingManager.setDrawingMode(null);

    // Create a new editable polygon from the overlay
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching within the polygon
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_At', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });
}

// This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow){
    // Check to make sure the infowindow is not already opened on this marker.
    if(infowindow.marker != marker){
      infowindow.marker = marker;
      infowindow.setContent('');

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function(){
        infowindow.marker = null;
      });

      var streetViewService = new google.maps.StreetViewService();

      function getStreetView(data, status){
        if(status == google.maps.StreetViewStatus.OK){
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
              nearStreetViewLocation, marker.position);
          infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: nearStreetViewLocation,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        }
        else{
          infowindow.setContent('<div>' + marker.title + '</div>' +
              '<div>No Street View Found.</div>');
        }
      }

      streetViewService.getPanorama({
        location: marker.position,
        radius: 50
      }, getStreetView);

      infowindow.open(map, marker);
    }
  }

  // This function will loop through the markers array and display them all
  function showListings(){
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for(var i = 0; i < markers.length; i++){
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  // This function will loop through the listings  and hide them all
  function hideListings(){
    for(var i = 0; i < markers.length; i++){
      markers[i].setMap(null);
    }
  }

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color.
  function makeMarkerIcon(markerColor){
    var markerImage = {
      url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
      size: new google.maps.Size(21, 34),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 34),
      scaledSize: new google.maps.Size(21, 34)
    };
    return markerImage;
  }

  // This shows and hides (respectively) the drawing options
  function toggleDrawing(drawingManager){
    if(drawingManager.map){
      drawingManager.setMap(null);
      // In case the user drew anything, get rid of the polygon
      if(polygon){
        polygon.setMap(null);
      }
    }else{
      drawingManager.setMap(map);
    }
  }

  // This function hides all markers outside the polygon,
  // and shows only the ones visible within it. This is so that the
  // user can specify an exact area of search.
  function searchWithinPolygon() {
    var positions = markers.map(function(marker){
      return marker.position;
    });
    
    var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    window.alert(area);

    for (var i = 0; i < markers.length; i++){
      if(google.maps.geometry.poly.containsLocation(markers[i].position, polygon)){
        markers[i].setMap(map);
      }else{
        markers[i].setMap(null);
      }
    }
  }

  // This function takes the input value in the find nearby area text input
  // locates it, and then zooms into that area. This is so that the user is
  // shown all listings, then decide to focus on one area of the map.
  function zoomToArea(){
    // Initialize the geocoder
    var geocoder = new google.maps.Geocoder();
    // Get the address or place that the user entered.
    var address = document.getElementById('zoom-to-area-text').value;
    // Make sure the address isn't blank
    if(address == ''){
      window.alert('You must enter an area, or address.');
    }else{
      // Geocode the address or area entered to get the center. Then, center the map
      // on it and zoom in
      geocoder.geocode({
        address: address,
        componentRestrictions: {
          locality: 'New York'
        }
      }, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
          document.getElementById('firstComponent').innerHTML="The Formatted Address is: " + results[0].formatted_address; 
            document.getElementById('secondComponent').innerHTML="The Location is " + results[0].geometry.location;
        }else{
          window.alert("We couldn't find that location - try entering a more" +
            "specific place.");
        }
      });
    }
  }

  // This function allows the user to input a desired travel time, in
  // minutes, and a travel mode, and a location - and only show the listings
  // that are within that travel time (via that travel mode) of the location
  function searchWithinTime(){
    // Initialize the distance matrix service.
    var distanceMatrixService = new google.maps.DistanceMatrixService();
    var address = document.getElementById('search-within-time-text').value;
    // Check to make sure the place entered isn't blank
    if (address == ''){
      window.alert('You must enter an address.');
    }else{
      hideListings();
      // Use the distance matrix service to calculate the duration of the 
      // routes between all our markers, and the destination address entered 
      // by the user. Then put all the origins into an origin matrix.
      var origins = [];
      for (var i = 0; i < markers.length; i++){
        origins[i] = markers[i].position;
      }
      var destination = address;
      var mode = document.getElementById('mode').value;
      // Now that both the origins and destination are defined, get all the
      // info for the distances between them
      distanceMatrixService.getDistanceMatrix({
        origins: origins,
        destinations: [destination],
        travelMode: google.maps.TravelMode[mode],
        unitSystem: google.maps.UnitSystem.IMPERIAL
      }, function(response, status){
        if(status !== google.maps.DistanceMatrixStatus.OK){
          window.alert("Error was: " + status);
        }else{
          displayMarkersWithinTime(response);
        }
      });
    }
  }

  // This function will go through each of the results, and,
  // if the distance is less than the value in the picker, 
  // show it on the top
  function displayMarkersWithinTime(response){
    var maxDuration = document.getElementById('max-duration').value;
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    // Parse through the results, and get the distance and duration of each.
    // Because there might be  multiple origins and destinations we have a nested loop
    // Then, make sure at least 1 result was found.
    var atleastOne = false;
    for(var i = 0; i < origins.length; i++){
      var results = response.rows[i].elements;
      for(var j = 0; j < results.length; j++){
        var element = results[j];
        if(element.status === "OK"){
          var distanceText = element.distance.text;
          var duration = element.duration.value / 60;
          var durationText = element.duration.text;
          if(duration <= maxDuration){
            markers[i].setMap(map);
            atleastOne = true;
            var infowindow = new google.maps.InfoWindow({
              content: durationText + 'away, ' + distanceText +
                "<div>" + "<input type='button' value='View Route' onclick='displayDirections(\"" +
                origins[i] + "\")'>" + "</div>"
            });
            infowindow.open(map, markers[i]);
            markers[i].infowindow = infowindow;
            google.maps.event.addListener(markers[i], 'click', function(){
              this.infowindow.close();
            });
          }
        }
      }
    }
    if(!atleastOne){
      window.alert("We could not find any location within that distance!");
    }
  }

  // This function is in response to the user selecting "show route" on one 
  // of the markers within the calculated distance. This will display the route 
  // on the map.
  function displayDirections(origin){
    hideListings();
    var directionsService = new google.maps.DirectionsService;
    // Get the destination address from the user entered value.
    var destinationAddress = document.getElementById('search-within-time-text').value;
    // Get mode again from the user entered value.
    var mode = document.getElementById('mode').value;
    var request = {
      // The origin is the passed in marker's position.
      origin: origin,
      destination: destinationAddress,
      travelMode: google.maps.TravelMode[mode]
    };
    directionsService.route(request, function(response, status){
      if(status === google.maps.DirectionsStatus.OK){
        var directionsDisplay = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          draggable: true,
          polylineOptions: {
            strokeColor: 'green'
          }
        });
      }else{
        window.alert('Directions request failed due to ' + status);
      }
    });
  }