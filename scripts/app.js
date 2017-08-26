// Create a variable for the map
var map;

var isOpenMenu = false;

// Create a blank array for listing all the markers
var markers = [];

var directionsDisplay;

// This global array is used to store nearby place markers for a default marker
var nearbyMarkers = [];

// This global polygon variable is to ensure only ONE polgon is rendered
var polygon = null;

// Create placeMarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

var largeInfowindow = '';
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
  largeInfowindow = new google.maps.InfoWindow({
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
    self.isLoggedIn = ko.observable().subscribeTo("isLoggedIn");
    self.userName = ko.observable().subscribeTo("currentUser");
    self.userId = ko.observable().subscribeTo("currentUserId");

    // An array of locations
    var locations = [
        {
          title: 'Toscano',
          location: {
            lat: 12.937074,
            lng: 77.585257
          },
          rating: 8.2
        },
        {
          title: 'McDonald\'s Family Restaurant',
          location: {
            lat: 12.975947888116648,
            lng: 77.59833873337735
          },
          rating: 5.5
        },
        {
          title: 'Hotel Shalimar Bar and Restaurant',
          location: {
            lat: 12.978237128484729,
            lng: 77.63729413423935
          },
          rating: 7.5
        },
        {
          title: 'J W Kitchen',
          location: {
            lat: 12.972084,
            lng: 77.594908
          },
          rating: 9
        },
        {
          title: 'Smoke House Deli',
          location: {
            lat: 12.9716781033626,
            lng: 77.59829956419803
          },
          rating: 8.8
        },
        {
          title: 'Peace Restaurant',
          location: {
            lat: 12.961816690417804,
            lng: 77.59796942343216
          },
          rating: 1
        },
        {
          title: "Sunny\'s\'",
          location: {
            lat: 12.972027516492824,
            lng: 77.59850100554686
          },
          rating: 8.3
        },
        {
          title: 'Airlines Hotel',
          location: {
            lat: 12.973048836038515,
            lng: 77.60000061317432
          },
          rating: 8.7
        },
        {
          title: 'Truffles - Ice & Spice',
          location: {
            lat: 12.971556788840994,
            lng: 77.60106935122289
          },
          rating: 9.2
        },
        {
          title: "Harima",
          location: {
            lat: 12.96741309690568,
            lng: 77.6004159450531
          },
          rating: 9.1
        },
        {
          title: 'Imperial Restaurant',
          location: {
            lat: 12.982122329627389,
            lng: 77.6031788201695
          },
          rating: 5.7
        }
      ];

    markers = new Markers(locations);

    /**
     * Shows the selected marker on the screen
     */
    self.showMarkerSelected = function(){
      showMarker(locations.indexOf(this), largeInfowindow);
    };


    self.values = ko.observable([1, 10]);


    self.clearValue = function() {
       self.query('');
       self.values([1, 10]);
       hideMarkers(nearbyMarkers);
       showListings(markers);
    };


    self.searchByRating = ko.observable(false);

    self.activateSearchByRating = function(){
      self.clearValue();
      self.searchByRating(!self.searchByRating());
    };

    /**
     * An observable variable to filter locations based on an input field
     */
    self.locations = ko.computed(function() {
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(locations, function(location) {
            if(self.query() !== "" && location.title.toLowerCase().indexOf(search) >= 0){
              showMarker(locations.indexOf(location), largeInfowindow);
            }
            if(search !== ""){
              return location.title.toLowerCase().indexOf(search) >= 0;
            }
            if(self.searchByRating){
              return (location.rating >= self.values()[0] && location.rating <= self.values()[1]);
            }
        });
    }, self);

    /**
     * An observable variable to sort locations alphabetically
     */
    self.sortedLocations = ko.computed(function() {
        return self.locations().sort(function (left, right){
          return left.title == right.title ? 0 :
              (left.title < right.title ? -1 : 1);
        });
    });

    // custom binding for slider
    ko.bindingHandlers.slider = {
        init: function (element, valueAccessor, allBindings) {
            var options = allBindings().sliderOptions || {};
            var $el = $(element);
            // current value
            var observable = valueAccessor();
            options.range = true;

            // function to update ui.values on slide
            options.slide = function(e, ui) {
                observable(ui.values);
            };

            // clean-up logic that runs when slider is removed by Knockout.
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $el.slider("destroy");
            });

            $el.slider(options);
        },
        update: function (element, valueAccessor) {
            var $el = $(element);
            var value = ko.unwrap(valueAccessor());
            $el.slider("values", value);
        }
    };

    self.rateRange = ko.computed(function() {
        return self.values()[0] + " - " + self.values()[1] ;
    }, self);

    // Add favorite lat-lng to database if user is logged in
    $(document).on('click', '#favorites', function(){
      if(self.userId() !== undefined){
        var favPos = $("#favorites").data("link");
        var title = $("#favorites").data("title");
        var favLocations = [];
        // Get the latitude
        var lat = favPos.substring(favPos.lastIndexOf("(")+1,favPos.lastIndexOf(","));

        // Get the longitude
        var lng = favPos.substring(favPos.lastIndexOf(",")+2,favPos.lastIndexOf(")"));
        console.log(lat);

        // Get a reference to the database service
        var data = {
          title: title,
          lat: lat,
          lng: lng
        };
        var newKey = firebase.database().ref().child('favorites').push().key;
        var updates = {};
        updates['/users/' + self.userId() + '/favorites/' + newKey] = data;
        firebase.database().ref().update(updates);

        // ('users/' + self.userId() + '/favorites/').push(favPos);
        console.log(self.userId());
      }else{
        $("#log-in-modal").modal('show');
      }
    });


  }

  ko.applyBindings(new LocationsViewModel(), document.getElementById("togglemenu"));

  // Show Listings button
  $('#show-listings').click(function(){
    hideMarkers(nearbyMarkers);
    showListings(markers);
  });

  // Hide Listings button
  $('#hide-listings').click(function(){
    hideMarkers(nearbyMarkers);
    hideMarkers(markers);
  });

  // Display default markers on map on page load
  showListings(markers);

  // Used to toggle the menu-panel
  var isClosed = false;

  // Used to toggle the photo panel
  var isClosedPhoto = false;

  $("#left-panel").click(function(){
    $("#left-panel").css('z-index', 300);
  });

  // Hide toggle menu on app load
  $("#togglemenu").hide();

  // Menu bar effects
  $(".menu-bar").click(function(){
      if(!isOpenMenu){
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
        isOpenMenu = true;
      }else if(open){
        $("#togglemenu").slideToggle(500);
        $(this).toggleClass("change");
        setTimeout(function() {
          $(".head-box").animate({
            width: 40
          }, 500);
        }, 500);
        $("#title").text("");
        isOpenMenu = false;
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

  $(document).on('click', '#get-directions', function(){
    closeMenu(true);
    var $getDirections = $('#get-directions');
    var origin = $getDirections.data('origin');
    var destination = $getDirections.data('destination');
    console.log(origin);
    console.log(destination);
    $("#menu-panel").css("visibility", "hidden");
    $("#photo-panel").css({"visibility": "hidden", "width": 0});
    $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
    $("#left-panel").css({"visibility": "hidden"});
    displayDirections(markers[origin].getPosition(), nearbyMarkers[destination].getPosition());
  });

  $(document).on('click', '#get-places', function(){
    closeMenu(true);
    $("#menu-panel").css("visibility", "hidden");
    $("#photo-panel").css({"visibility": "hidden", "width": 0});
    $("#close-photo-panel").css({"visibility": "hidden", "width": 0});
    $("#left-panel").css({"visibility": "hidden"});
    nearbySearchPlaces();
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


  $("#close-directions").click(function(){
    $("#right-panel-menu").css("width", "0");
    document.getElementById('right-panel-menu').style.visibility = "hidden";
    directionsDisplay.setMap(null);
  });
}


function PointTolatLng(point) {
 var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
 var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
 var scale = Math.pow(2, map.getZoom());
 return map.getProjection().fromPointToLatLng(new google.maps.Point((point.x / scale) + bottomLeft.x, (point.y / scale) + topRight.y));
}

/**
 * This function closes panels except the selected panel
 * @param {Boolean} openI
 */
function closeMenu(openI){
  if(isOpenMenu === openI){
    $("#togglemenu").slideToggle(500);
    $(".menu-bar").toggleClass("change");
    setTimeout(function() {
      $(".head-box").animate({
        width: 40
      }, 500);
    }, 500);
    $("#title").text("");
    isOpenMenu = false;
  }
}

/**
 * This function hides the infowindow.
 * @param {Object} marker The marker for which to close the infowindow
 * @param {Object} infowindow The infowindow instance to close
 */
function hideInfoWindow(marker, infowindow){
  infowindow.marker = null;
}

/**
 * This function populates the infowindow when the marker is clicked.
 * @param {Object} marker The marker for which to open the infowindow
 * @param {Object} infowindow The infowindow instance to open
 */
function populateInfoWindow(marker, infowindow){
  // If not largeInfowindow, close any open largeInfowindow
  if(infowindow !== largeInfowindow){
    largeInfowindow.close();
  }
  // Check to make sure the infowindow is not already opened on this marker.
  if(infowindow.marker != marker){
    infowindow.marker = marker;
    var content = '<div class="m-title" style="width:270px; overflow: hidden;"><h2>' + marker.title + '</h2>' +
      '<span  data-title="' + marker.title + '" data-link="' + marker.getPosition() + '" id="favorites" class="glyphicon glyphicon-heart-empty"></span>' + '<div>' +
      '<button class="btn btn-xs btn-primary" data-id="' + ($.inArray(marker, markers) !== -1 ? marker.id : "") +
        '" data-title="' +
      marker.title + '" data-position="' + marker.getPosition().toString() +
      '" id="marker-more">More...</button><span>&nbsp;&nbsp;</span>' +
      '<button id="get-images"' +
      '" class="btn btn-xs btn-primary">Get Photos</button><span>&nbsp;&nbsp;</span>' +
      '<button id="get-tips"' +
      '" class="btn btn-xs btn-primary">Get Tips</button><span>&nbsp;&nbsp;</span>';

    if(markers.indexOf(marker) !== -1){
      content += '<button style="margin-top: 10px;" id="get-places"' +
      '" class="btn btn-xs btn-primary">Get Nearby Places of Interest</button>';
    }

    content += '</div></div>';

    // Set content fr the infowindow
    infowindow.setContent(content);

    // Custom modification done to the infowindow
    var $iw = $('.m-title').parents('.gm-style-iw');
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
  hideMarkers(nearbyMarkers);
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
function showListings(param){
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for(var i = 0; i < param.length; i++){
      param[i].setMap(map);
      param[i].setAnimation(google.maps.Animation.DROP);
      bounds.extend(param[i].position);
  }
  map.fitBounds(bounds);
}

/**
 * This function will loop through the listings and hide them all
 * @param {Array} markers The array of markers to hide
 */
function hideMarkers(param){
  for(var i = 0; i < param.length; i++){
    param[i].setMap(null);
  }
  nearbyMarkers = [];
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
function displayDirections(origin, destination){
  var directionsService = new google.maps.DirectionsService;
  var infoWindow = new google.maps.InfoWindow();
  // Get mode again from the user entered value.
  var request = {
    // The origin is the passed in marker's position.
    origin: origin,
    destination: destination,
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
        },
      });
      $("#right-panel-menu").css("width", "340px");
      document.getElementById('right-panel-menu').style.visibility = "visible";
      document.getElementById('right-panel').innerHTML = "";

      directionsDisplay.setPanel(document.getElementById("right-panel"));
    }else{
      window.alert('Directions request failed due to ' + status);
    }
  });
}


/**
 * This function is in response to the user selecting "show nearby places" on one
 * of the default markers . This will display the nearby restaurants within a radius of 500
 * on the map.
 */
function nearbySearchPlaces(){
  var $markerMore = $("#get-places").siblings("#marker-more");
  var centeredMarker = markers[$markerMore.data("id")];
  var lat_lng = centeredMarker.getPosition();
  console.log(lat_lng);
  var request = {
    location: lat_lng,
    radius: '500',
    type: ['restaurant']
  };
  hideInfoWindow(centeredMarker, largeInfowindow)

  // var newIcon = {
  //   url: './assets/star-128.png',
  //   size: new google.maps.Size(21, 34),
  //   origin: new google.maps.Point(0, 0),
  //   anchor: new google.maps.Point(10, 34),
  //   scaledSize: new google.maps.Size(25, 25)
  // }
  map.setCenter(lat_lng);
  var nearInfo = new google.maps.InfoWindow({
    maxWidth: 270
  });

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      var bounds = new google.maps.LatLngBounds();
      hideMarkers(markers);
      // Hide previous nearby markers
      hideMarkers(nearbyMarkers);
      nearbyMarkers = [];
      centeredMarker.setMap(map);
      // centeredMarker.setIcon(newIcon);
      // google.maps.event.clearListeners(centeredMarker, 'mouseout');
      // google.maps.event.clearListeners(centeredMarker, 'mouseover');
      // centeredMarker.addListener('mouseout', function(){
      //   this.setAnimation(null);
      // });
      for(var i = 0; i < results.length; i++){
        var image = {
          url: results[i].icon,
          size: new google.maps.Size(21, 34),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(10, 34),
          scaledSize: new google.maps.Size(25, 25)
        };
        var marker = new google.maps.Marker({
          position: results[i].geometry.location,
          title: results[i].name,
          icon: image,
          animation: google.maps.Animation.DROP
        });
        nearbyMarkers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', (function(m){
          return function(){
            m.setAnimation(google.maps.Animation.BOUNCE);
            populateInfoWindow(m, nearInfo);
            if($("#get-directions").length === 0){
              nearInfo.setContent(nearInfo.getContent() + '<div class="m-title"><button data-origin="' + centeredMarker.id +
              '" data-destination="' + nearbyMarkers.indexOf(m) + '" id="get-directions"' +
              '" class="btn btn-xs btn-primary">Show Directions</button></div>');
            }
          };
        })(marker));
        // Reset the marker color to default on mouseout
        marker.addListener('mouseout', function(){
          this.setAnimation(null);
        });
      }
      showListings(nearbyMarkers);
    }
  });
}

