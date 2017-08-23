// Create a variable for the map
var map;

var isOpen = false;

// Create a blank array for listing all the markers
var markers = [];

var directionsDisplay;

// This global polygon variable is to ensure only ONE polgon is rendered
var polygon = null;

// Create placeMarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

/**
 * Initial function called once the Google map libraries are loaded
 */
function initMap() {

  // Create a styles array to use with the map
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
    center: {lat: 12.971599, lng: 77.594563},
    zoom: 13,
    mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                    'styled_map'],
            style: google.maps.MapTypeControlStyle.HORIZONTAL_MENU,
            position: google.maps.ControlPosition.TOP_CENTER
          },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_DOWN
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_RIGHT
    }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  // Instantiate info window with default width of 350px
  var largeInfowindow = new google.maps.InfoWindow({
    maxWidth: 270
  });

  // Style the markers to create our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');
  
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');
  
  /**
   * This function creates default markers
   * @param {Array} locations
   * @returns {Object}
   */
  function Markers(locations){
    var self = this;
    self.markers = [];
    for (var i = 0; i < locations.length; i++) {
      var position = locations[i].location;
      var title = locations[i].title;
      // Create a marker object 
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });
      // Push the marker to our array of markers.
      self.markers.push(marker);
      // Create an onclick event to open an infowindow at each marker.
      marker.addListener('click', function(){
        this.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(this, largeInfowindow);
        hideElems();
      });
      // Change the color of the marker on mouseover
      marker.addListener('mouseover', function(){
        this.setIcon(highlightedIcon);
      });
      // Reset the marker color to default on mouseout
      marker.addListener('mouseout', function(){
        this.setAnimation(null);
        this.setIcon(defaultIcon);
      });
    }

    return self.markers;
  }

  /**
   * This function is our locations viewmodel
   */
  function LocationsViewModel(){
    var self = this;
    self.query = ko.observable('');
    self.clearValue = function() {       
       self.query('');
       showListings();
    };

    // An array of locations
    var locations = [
        {title: 'Toscano', location: {lat: 12.937074, lng: 77.585257}},
        {title: 'McDonald\'s Family Restaurant', location: {lat: 12.975947888116648, lng: 77.59833873337735}},
        {title: 'Hotel Shalimar Bar and Restaurant', location: {lat: 12.978237128484729, lng: 77.63729413423935}},
        {title: 'J W Kitchen', location: {lat: 12.972084, lng: 77.594908}},
        {title: 'Smoke House Deli', location: {lat: 12.9716781033626, lng: 77.59829956419803}},
        {title: 'Peace Restaurant', location: {lat: 12.961816690417804, lng: 77.59796942343216}},
        {title: "Sunny\'s\'", location: {lat: 12.972027516492824, lng: 77.59850100554686}},
        {title: 'Airlines Hotel', location: {lat: 12.973048836038515, lng: 77.60000061317432}},
        {title: 'Truffles - Ice & Spice', location: {lat: 12.971556788840994, lng: 77.60106935122289}},
        {title: "Harima", location: {lat: 12.96741309690568, lng: 77.6004159450531}},
        {title: 'Imperial Restaurant', location: {lat: 12.982122329627389, lng: 77.6031788201695}}   
      ];

    markers = new Markers(locations);

    /**
     * Shows the selected marker on the screen
     */
    self.showMarkerSelected = function(){
      showMarker(locations.indexOf(this), largeInfowindow);
    };

    /**
     * An observable variable to filter locations based on an input field
     */
    self.locations = ko.dependentObservable(function() {
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(locations, function(location) {
            if(self.query() !== "" && location.title.toLowerCase().indexOf(search) >= 0){
              showMarker(locations.indexOf(location), largeInfowindow);
            }
            return location.title.toLowerCase().indexOf(search) >= 0;
        });
    }, self);
  }

  ko.applyBindings(new LocationsViewModel());

  $('#show-listings').click(function(){showListings()});
  $('#hide-listings').click(function(){
    hideMarkers(markers);
  });

  // Display default markers on map on page load
  showListings();

  // Used to toggle the menu-panel
  var isClosed = false;
  // Used to toggle the photo panel
  var isClosedPhoto = false;

  $("#left-panel").click(function(){
    $("#left-panel").css('z-index', 300);
  });

  $("#hide-route").click(function(){
    $(this).text(function(i, text){
        return text === "Hide Directions" ? "Show Directions" : "Hide Directions";
    })
    $(this).toggleClass("btn-danger");
    $(this).toggleClass("btn-success");
    if( $("#right-panel").css('visibility') == 'visible'){
      $("#right-panel").css("visibility", "hidden");
      $("#right-panel").css("height", 0);
    }else {
      $("#right-panel").css("visibility", "visible");
      $("#right-panel").css("height", "auto");
    }
  });
  $("#togglemenu").hide();

  $(".menu-bar").click(function(){
      if(!isOpen){
        $("#menu-panel").css("visibility", "hidden");
        $("#photo-panel").css({"visibility": "hidden", "width": 0});
        $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
        $("#left-panel").css({"visibility": "hidden"});
        $("#title").text("Foodster");
        $(".head-box").animate({
          width: 340
        }, 500);
        $(this).toggleClass("change");
        setTimeout(function() { 
            $("#togglemenu").slideToggle(500);
        }, 500);
        isOpen = true;
      }else if(open){
        $("#togglemenu").slideToggle(500);
        $(this).toggleClass("change");
        setTimeout(function() {
          $(".head-box").animate({
            width: 40
          }, 500);    
        }, 500);
        $("#title").text("");
        isOpen = false;
      }
  });

  // Get tips
  $(document).on('click', '#get-tips', function(){
    closeMenu(true);
    $("#menu-panel").css("visibility", "hidden");
    $("#photo-panel").css({"visibility": "hidden", "width": 0});
    $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
    $("#left-panel").css('z-index', 300);
    $("#left-panel").css({"opacity":0.0, "visibility": "visible"}).animate({
      opacity: 1
    }, {duration: 500, queue: false});
    $("#left-panel").animate({
      height: '80%'
    }, {duration: 500, queue: false});
    loadTips();
  });

  // Get more information
  $(document).on('click', '#marker-more', function(){
    closeMenu(true);
    $("#four-square").empty();
    $("#photo-panel").css({"visibility": "hidden", "width": 0});
    $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
    $("#left-panel").css({"visibility": "hidden"});
    $("#menu-panel").css({"top": "0px", "overflow-y": "auto", 'z-index': 100, "visibility": "visible"});
    $("#menu-panel").animate({
      height: '80%'
    }, 500);
    isClosed = false;
    loadData();
  });

  // Get images
  $(document).on('click', '#get-images', function(){
    closeMenu(true);
    $("#left-panel").css({"visibility": "hidden"});
    $("#menu-panel").css("visibility", "hidden");
    $('#close-photo-panel').css({"visibility": "visible", 'right': 0, 'width': 0});
    $('#close-photo-panel h1 span').removeClass("glyphicon-chevron-left");
    $('#close-photo-panel h1 span').addClass("glyphicon-chevron-right");
    $("#photo-panel").css({"width": 0, "visibility": "visible"});
    $("#photo-panel").animate({
      width: '220px'
    }, {duration: 500, queue: false});
    $('#close-photo-panel').animate({
      width: '40px',
      right: '220px'
    }, {duration: 500, queue: false});
    isClosedPhoto = false;
    $("image-square").empty();
    $("#modalImages .modal-body").empty();
    loadImages();
  });

  // Close the photo-panel
  $('#close-photo-panel').click(function(){
    if(!isClosedPhoto){
      $('#photo-panel').css('overflow', 'hidden');
      $("#photo-panel").animate({
        width: 0
      }, {duration: 500, queue: false});
      $(this).animate({
        right: 0
      }, {duration: 500, queue: false});
      $('#close-photo-panel h1 span').removeClass("glyphicon-chevron-right");
      $('#close-photo-panel h1 span').addClass("glyphicon-chevron-left");
      isClosedPhoto = true;
    }else{
      $('#photo-panel').css('overflow', 'auto');
      $('#close-photo-panel h1 span').removeClass('glyphicon-chevron-left');
      $('#close-photo-panel h1 span').addClass('glyphicon-chevron-right');
      $("#photo-panel").css("visibility", "visible");
      $(this).animate({
        right: '220px'
      }, {duration: 500, queue: false});
      $("#photo-panel").animate({
        width: '220px'
      }, {duration: 500, queue: false});
      isClosedPhoto = false;
    }
  });

  // Reduce the panel showing information about the place
  $(document).on('click', '#venue-detail-menu', function(){
    if(!isClosed){
      $("#menu-panel").css({"top": "-50px", "overflow-y": "hidden"});
      $("#menu-panel").animate({
        height: 0
      }, 500);
      $('.venue-p').hide();
      $(this).removeClass('glyphicon-chevron-up');
      $(this).addClass('glyphicon-chevron-down');
      isClosed = true;
    }else{
      $("#menu-panel").css({"top": "0px", "overflow-y": "auto"});
      $(this).removeClass('glyphicon-chevron-down');
      $(this).addClass('glyphicon-chevron-up');
      $("#menu-panel").animate({
        height: '70%'
      }, 500);
      $('.venue-p').show();
      isClosed = false;
    }
  });

  // Close the panel showing tips for the place
  $("#close-reviews").click(function(){
    $("#left-panel").css('z-index', 100);
    $("#left-panel").animate({
      height: 0
    }, {duration: 500, queue: false});
    $("#left-panel").css({opacity: 1.0, visibility: "visible"}).animate({
      opacity: 0
    }, {duration: 500, queue: false});
  });
}

/**
 * This function closes panels except the selected panel
 * @param {Boolean} openI
 */
function closeMenu(openI){
  if(isOpen === openI){
    $("#togglemenu").slideToggle(500);
    $(".menu-bar").toggleClass("change");
    setTimeout(function() {
      $(".head-box").animate({
        width: 40
      }, 500);    
    }, 500);
    $("#title").text("");
    isOpen = false;
  }
}

/**
 * This function populates the infowindow when the marker is clicked.
 * @param {Object} marker The marker for which to open the infowindow
 * @param {Object} infowindow The infowindow instance to open
 */
function populateInfoWindow(marker, infowindow){
  // Check to make sure the infowindow is not already opened on this marker.
  if(infowindow.marker != marker){
    infowindow.marker = marker; 
    // Set content fr the infowindow 
    infowindow.setContent('<div class="m-title" style="width:270px; overflow: hidden;"><h2>' + marker.title + '</h2><div>' + 
      '<button class="btn btn-xs btn-primary" data-title="' + 
      marker.title + '" data-position="' + marker.position + 
      '" id="marker-more">More...</button><span>&nbsp;&nbsp;</span>' + 
      '<button id="get-images"' + 
      '" class="btn btn-xs btn-primary">Get Photos</button><span>&nbsp;&nbsp;</span>' + 
      '<button id="get-tips"' + 
      '" class="btn btn-xs btn-primary">Get Tips</button></div></div>');

    // Custom modification done to the infowindow
    var $iw = $('m-title').parents('.gm-style-iw');
    $iw.css({
      'overflow': 'hidden',
      'width': '270px !important',
      'top': '15px !important',
      'left': '0px !important',
      'background-color': '#fff',
      '-webkit-box-shadow': '0 2px 6px rgba(0,0,0,.3)',
      '-moz-box-shadow': '0 2px 6px rgba(0,0,0,.3)',
      'box-shadow': '0 2px 6px rgba(0,0,0,.3)',
      'border': '1px solid rgba(72, 181, 233, 0.6)'
    });

    // When the <div> containing the InfoWindow's content is attached to the DOM
    // run the callback function
    infowindow.addListener('domready', function(){
      $iw.prev().children(':nth-child(2)').css('display', 'none');
      $iw.prev().children(':nth-child(4)').css({'display' : 'none'});
      $iw.next().css({'zIndex': '100', right: '60px', top: '20px'});
    });

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function(){
      infowindow.marker = null;
      hideElems();
    });

    // Open the infowindow for the marker
    infowindow.open(map, marker);
  }
}

/**
 * This function will hide all other elements
 */
function hideElems(){
  $("#menu-panel").css("visibility", "hidden");
  $("#photo-panel").css({"visibility": "hidden", "width": 0});
  $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
  $("#left-panel").css({"visibility": "hidden"});
}

/**
 * This function will show a single marker only while hiding the rest
 * @param {Number} index The index of the marker to show on the map
 */
function showMarker(index, infowindow){
  var bounds = new google.maps.LatLngBounds();
  // Hide all markers before displaying the single marker
  hideMarkers(markers);

  // Extend the boundaries of the map for a single marker and display the marker
  markers[index].setMap(map);
  populateInfoWindow(markers[index], infowindow);
  markers[index].setAnimation(google.maps.Animation.DROP);
  bounds.extend(markers[index].position);
  map.fitBounds(bounds);
}

/**
 * This function will loop through the markers array and display them all
 */
function showListings(){
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for(var i = 0; i < markers.length; i++){
      markers[i].setMap(map);
      markers[i].setAnimation(google.maps.Animation.DROP);
      bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

/**
 * This function will loop through the listings and hide them all
 * @param {Array} markers The array of markers to hide
 */
function hideMarkers(markers){
  for(var i = 0; i < markers.length; i++){
    markers[i].setMap(null);
  }
}

/**
 * This function takes in a COLOR, and then creates a new marker
 * icon of that color.
 * @param {String} markerColor The color to apply to the marker
 * @returns {Object} The markerImage object
 */
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

/**
 * This function is in response to the user selecting "show route" on one
 * of the markers within the calculated distance. This will display the route
 * on the map.
 * @param {String} markerColor The color to apply to the marker
 * @returns {Object} The markerImage object
 */
function displayDirections(origin){
  hideMarkers(markers);
  var directionsService = new google.maps.DirectionsService;   
  var destinationAddress = '';
  var infoWindow = new google.maps.InfoWindow();
  // Get the destination address as user's address.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      destinationAddress = pos;
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }
  // Get mode again from the user entered value.
  var request = {
    // The origin is the passed in marker's position.
    origin: origin,
    destination: destinationAddress,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status){
    if(status === google.maps.DirectionsStatus.OK){
      if(directionsDisplay != null) {
          directionsDisplay.setMap(null);
          directionsDisplay = null;
      }
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        draggable: true,
        polylineOptions: {
          strokeColor: 'green'
        }
      });
      $("#hide-route").removeClass("btn-success");
      $("#hide-route").addClass("btn-danger");
      $("#hide-route").text("Hide Directions");
      $("#right-panel").css("height", "auto");
      document.getElementById('right-panel').style.visibility = "visible";
      document.getElementById('right-panel').innerHTML = "";
      directionsDisplay.setPanel(document.getElementById("right-panel"));
    }else{
      window.alert('Directions request failed due to ' + status);
    }
  });
}

/**
 * This function loads data from the FOURSQUARE API
 */
function loadData(){
  var fourSquareUrl = fourSquare();
  var $fourSquare = $("#four-square");
  var venue = {};
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      getVenueData(venue);
    })
    .fail(function(err){
        $fourSquare.text('The data cannot be loaded. Please try again after some time.');
    });   
    return false;
}

/**
 * This function when called loads images for a venue
 */
function loadImages(){
  var $imageSquare = $("#image-square");
  $imageSquare.empty();
  $(".modal-body").empty();
  var fourSquareUrl = fourSquare();
  var venue = {};
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      venueDetails(venue.id, 'image');
    })
    .fail(function(err){
        $imageSquare.text('The data cannot be loaded. Please try again after some time.');
    });   
    return false;
}

/**
 * This function when called loads the user tips for a venue
 */
function loadTips(){
  var $venueTips = $("#venue-tips");
  var fourSquareUrl = fourSquare();
  var venue = {};
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      venueTips(venue.id);
    })
    .fail(function(err){
        $venueTips.text('The data cannot be loaded. Please try again after some time.');
    });   
    return false;
}

/**
 * This function makes initial call to the FOURSQUARE API
 */
function fourSquare(){
  var $markerMore = $("#marker-more");
  var $venueTips = $("#venue-tips");
  $venueTips.empty();

  var lat_lng = $markerMore.data("position").toString();
  lat_lng = lat_lng.substr(1, lat_lng.length - 2);

  var fourSquareUrl = "https://api.foursquare.com/v2/venues/search";
  fourSquareUrl += '?' + $.param({
    'v': '20170820',
    'll': lat_lng,
    // 'client_id': '41PGT0MW5WP2YLYOMO5GVVLOSXY31V1CP45PCHAWQDNRHI4I',
    'client_id': 'F1E2HZDPZGHKNSK54DWPNAPW3ADHKL0V0IBHLD1ZN1KPMJNG',
    // 'client_secret': '13ETNO1CLGHIOTSPJCUWX0KJ2IE1M3BBW5ZM0PN5530HWMSZ'
    'client_secret': '2HTYTSWFTZUS144ABHWAHAQLVCGQMHTKIONLROWJHOVJCOOF'
  });
  return fourSquareUrl;
}

/**
 * This is a helper function to retrieve information about
 * a venue based on venue id
 * @param {Number} name
 * @returns {Object}
 */
function getVenueData(venue){
  var $fourSquare = $("#four-square");
  var heading = $('#menu-panel-heading');
  var venue_name = '';
  var address = '';
  var category = '';
  var venue_url = '';
  var venue_phone = '';
  var venue_facebook = '';
  var venue_twitter = '';
  var icon = '';
  var facebook_name = '';
  var venueId = venue.id;
  var innerHTML = "";
  $fourSquare.html("");
  if(venue !== null || venue !== undefined){
    venue_name = venue.name;
    if(venue.location.formattedAddress){
      address = "";
      address = venue.location.formattedAddress.join(", ");
    }
    if(venue.categories !== null && venue.categories !== undefined){
      $.each(venue.categories, function(index, value){
        category += value.name;
      });
    }
    if(venue.url !== null && venue.url !== undefined){
      venue_url = venue.url;
    }

    if(venue.contact.formattedPhone !== null && venue.contact.formattedPhone !== undefined){
      venue_phone = venue.contact.formattedPhone;
    }
    if(venue.contact.facebook !== null && venue.contact.facebook !== undefined){
      venue_facebook = venue.contact.facebook;
    }
    if(venue.contact.facebookUsername !== null && venue.contact.facebookUsername !== undefined){
      facebook_name = venue.contact.facebookUsername;
    }
    if(venue.contact.twitter !== null && venue.contact.twitter !== undefined){
      venue_twitter = venue.contact.twitter;
    }
    if(venue.categories[0].icon !== null && venue.categories[0].icon !== undefined){
      icon = venue.categories[0].icon.prefix + "bg_100" + venue.categories[0].icon.suffix;
    }
  }else{
    $fourSquare.append("<div><p>No data found.</p></div>");
    return;
  }

  $fourSquare.text("");

  heading.html("<div class='main-title'><img style='float:left; margin-right: 4px;' src='" + icon + "'><h2 style='margin-bottom: 0; padding-right: 20px;' id='venue_name' data-id='" + venueId + "'>"
   + venue_name + "</h2></div><div class='clearfix'></div>"); 
  
  if(venue_url){
    innerHTML += "<p class='venue-p'><span class='icon glyphicon glyphicon-globe'></span> <a href='venue_url" + "'>" + venue_url + "</a></p>";
  }
  
  if(category){
    innerHTML += "<p class='venue-p'><span class='icon glyphicon glyphicon-tag'></span> <span class='label label-success'> " + category + " </span></p>";
  }
  if(address){
    innerHTML += "<p class='venue-p'><span class='icon glyphicon glyphicon-map-marker'></span> " + address + "</p>";
  }
  if(venue_phone){
    innerHTML += "<p class='venue-p'><span class='icon glyphicon glyphicon-phone'></span> " + venue_phone +"</p>";
  }
  if(venue_facebook && facebook_name){
    innerHTML += "<p class='venue-p'><span class='icon'><i class='fa fa-facebook' aria-hidden='true'></i></span><a href='https://fb.com/" + venue_facebook + "'> #" + facebook_name +"</a></p>";
  }
  if(venue_twitter){
    innerHTML += "<p class='venue-p'><span class='icon'><i class='fa fa-twitter' aria-hidden='true'></i></span><a href='https://twitter.com/" + venue_twitter + "'> #" + venue_twitter +"</a></p>";
  }

  $fourSquare.append(innerHTML);
  venueDetails(venue.id, 'data');
}

/**
 * This function retrieves venue details for a venue id
 * @param {Number} venueId
 * @param {String} choice Choice may be data or image
 */
function venueDetails(venueId, choice){
  var fourSquareVenue = "https://api.foursquare.com/v2/venues/" + venueId;
  fourSquareVenue += '?' + $.param({
    'v': '20170820',
    // 'client_id': '41PGT0MW5WP2YLYOMO5GVVLOSXY31V1CP45PCHAWQDNRHI4I',
    'client_id': 'F1E2HZDPZGHKNSK54DWPNAPW3ADHKL0V0IBHLD1ZN1KPMJNG',
    // 'client_secret': '13ETNO1CLGHIOTSPJCUWX0KJ2IE1M3BBW5ZM0PN5530HWMSZ'
    client_secret: '2HTYTSWFTZUS144ABHWAHAQLVCGQMHTKIONLROWJHOVJCOOF'
  });
  var result = '';
  $.getJSON(fourSquareVenue)
  .done(function(data){
    if(data.response.venue !== null && data.response.venue !== undefined){
      if(choice === 'data'){
        returnVenue(data.response.venue);
      }else if(choice === 'image'){
        returnVenueImage(data.response.venue);
      }
    }
  });
}


/**
 * This function retrieves tips for a venue id
 * @param {Number} venueId
 */
function venueTips(venueId){
  var fourSquareTips = "https://api.foursquare.com/v2/venues/" + venueId + "/tips";
  fourSquareTips += '?' + $.param({
    'v': '20170820',
    // 'client_id': '41PGT0MW5WP2YLYOMO5GVVLOSXY31V1CP45PCHAWQDNRHI4I',
    'client_id': 'F1E2HZDPZGHKNSK54DWPNAPW3ADHKL0V0IBHLD1ZN1KPMJNG',
    // 'client_secret': '13ETNO1CLGHIOTSPJCUWX0KJ2IE1M3BBW5ZM0PN5530HWMSZ'
    'client_secret': '2HTYTSWFTZUS144ABHWAHAQLVCGQMHTKIONLROWJHOVJCOOF'
  });
  var result = '';
  $.getJSON(fourSquareTips)
  .done(function(data){
    returnVenueTips(data.response.tips.items);
  })
  .fail(function(){
    returnVenueTips("Error");
  });
}

/**
 * This is a helper function to retrieve general information for a venue
 * @param {Array} data
 */
function returnVenue(data){
  var venueDetails = data;
  var checkins = '';
  var users = '';
  var visits = '';
  var hours = {};
  var photos = [];
  var $fourSquare = $('#four-square');
  var innerHTML = '';
  var rating = "";
  if(venueDetails !== null && venueDetails !== undefined){
    if(venueDetails.stats !== null && venueDetails.stats !== undefined){
        checkins = venueDetails.stats.checkinsCount ? venueDetails.stats.checkinsCount : "N/A";
        users = venueDetails.stats.usersCount ? venueDetails.stats.usersCount : "N/A";
        visits = venueDetails.stats.visitsCount ? venueDetails.stats.visitsCount : "N/A";
      }
    if(venueDetails.hours !== null && venueDetails.hours !== undefined){
        hours.status = venueDetails.hours.status;
        hours.isOpen = venueDetails.hours.isOpen;
        hours.time = venueDetails.hours.timeframes[0].days + ": " + 
                      venueDetails.hours.timeframes[0].open[0].renderedTime;
      }

    if(venueDetails.ratingColor){
      rating = "<span class='label' style='margin-right: 10px; background-color: #" + venueDetails.ratingColor + ";'>";
    }
    if(venueDetails.rating){
      rating += venueDetails.rating + "</span>";
    }
    if(venueDetails.ratingSignals){
      rating += "<span style='font-size: 12px;'><b><em>" + venueDetails.ratingSignals + " Reviews</em></b></span>";
    }
    $(".main-title h2").after(rating);

    if(checkins){
      innerHTML = "<ul class='list-group'><li class='venue-p list-group-item'><span class='badge'>" + checkins + "</span>Checkins </li>";
    }
    if(users){
      innerHTML += "<li class='venue-p list-group-item'><span class='badge'>" + users + "</span>Users </li>";
    }
    if(visits){
      innerHTML += "<li class='venue-p list-group-item'><span class='badge'>" + visits + "</span>Visits </li></ul>";
    }
    if(hours){
      if(hours.status){
        innerHTML += "<p class='venue-p'><span class='icon glyphicon glyphicon-time'></span> " +
          hours.status + " (<a id='show-more' href='#'>show more</a>" + ") </p><p id='time'></p>";
      }
      if(hours.isOpen){
        innerHTML += "<p class='venue-p' style='color: green;'><b>Open now </b></p>";
      }else{
        innerHTML += "<p class='venue-p' style='color: red;'><b>Closed </b></p>";
      }
    }
    $fourSquare.append(innerHTML);
    $("#time").hide();
    if(hours.time){
      $("#time").text(" " + hours.time + " ");
    }else{
      $('#time').text(' No info available.');
    }
    $("#show-more").click(function(){
      $('#time').slideToggle();
      if($('#show-more').text() === "show more"){
        $('#show-more').text("show less");
      }else if($('#show-more').text() === "show less"){
        $('#show-more').text("show more");
      }
    });
  }else{
    $fourSquare.append("<div><p>No time records found.</p></div>");
  }
}

/**
 * This is a helper function to retrieve images for a venue
 * @param {Array} data
 */
function returnVenueImage(data){
  var venueDetails = data;
  var images = [];
  var $imageSquare = $("#image-square");
  var innerHTML = '';
  var modalHTML = '';
  $imageSquare.html("");
  if(venueDetails.photos.groups.length !== 0){
    images = venueDetails.photos.groups[0].items;
  }
  innerHTML = '<div class="image-row row">';
  if(images.length !== 0){
    $.each(images, function(i, image){
      innerHTML += '<div class="col-xs-12"><a class="thumbnail">' +
        '<img src="' + image.prefix + '171x180' + image.suffix + '" alt="image-' + i + '"></a></div>';
    });
    innerHTML += '</div>';
    $imageSquare.html(innerHTML);
    $('.col-xs-12 .thumbnail img').click(function(){
      var index = $(this).parents('.col-xs-12').index();
      var src = $(this).attr('src');
      src = src.replace('171x180', '960x720');
      modalHTML = '<img style="width:100%;" src="' + src + '">';
      modalHTML += '<div class="control-div">';
      modalHTML += '<button class="btn btn-xs btn-success controls next" data-index="'+ 
                    (index+2) + '">next <span class="glyphicon glyphicon-chevron-right"></span></button>';
      modalHTML += '<button class="btn btn-xs btn-success controls prev" data-index="'+ 
                    (index) + '"><span class="glyphicon glyphicon-chevron-left"></span> prev</button>';
      modalHTML += '</div>';
      $('#modalImages').modal();
      $('#modalImages').on('shown.bs.modal', function(){
          $('#modalImages .modal-body').html(modalHTML);
          $('button.controls').trigger('click');
      });
      $('#modalImages').on('hidden.bs.modal', function(){
          $('#modalImages .modal-body').html("");
      });
    });
  }else{
    innerHTML = '<div class="col-xs-12"><p class="thumbnail">No images found in the database.</p></div></div>';
    $imageSquare.html(innerHTML);
  }
} 

// On click event for prev and next buttons of the image modal
$(document).on('click', 'button.controls', function(){
  var index = $(this).data('index');
  var src = $('.image-row .col-xs-12:nth-child('+ index +') .thumbnail img').attr('src');
  if(src){
    src = src.replace('171x180', '960x720');
  }
  $('.modal-body img').attr('src', src);
  $('.modal-body img').fadeOut('slow', function () {
    $(this).fadeIn(3000);
  });
  var newPrevIndex = parseInt(index) - 1;
  var newNextIndex = parseInt(newPrevIndex) + 2;
   
  if($(this).hasClass('prev')){
      $(this).data('index', newPrevIndex);
      $('button.next').data('index', newNextIndex);
  }else{
      $(this).data('index', newNextIndex);
      $('button.prev').data('index', newPrevIndex);
  }
  var total = $(document).find('.image-row .col-xs-12').length + 1;

  //hide next button
  if(newNextIndex === total){
      $('button.next').hide();
  }else{
      $('button.next').show();
  }
  //hide previous button
  if(newPrevIndex === 0){
      $('button.prev').hide();
  }else{
      $('button.prev').show();
  }
});

/**
 * This is a helper function to retrieve user tips
 * @param {Array} data
 */
function returnVenueTips(data){
  var self = this;
  var $venueTips = $("#venue-tips");
  var innerHTML = '';
  self.tips = ko.observableArray();
  var tip = {};
  if(data && typeof data === 'object' && data.constructor === Array){
    $.each(data, function(index, value){
      tip.src = value.user.photo.prefix + "100x100" + value.user.photo.suffix;
      tip.firstName = (value.user.firstName ? value.user.firstName : "");
      tip.lastName = (value.user.lastName ? value.user.lastName : "");
      tip.review = value.text;
      self.tips.push(tip);
    });
  }
}

ko.applyBindings(new returnVenueTips(), $("#venue-tips"));