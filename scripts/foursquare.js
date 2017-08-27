// foursquare client id
var FOURSQUARE_CLIENT_ID = "41PGT0MW5WP2YLYOMO5GVVLOSXY31V1CP45PCHAWQDNRHI4I";

// foursquare client secret
var FOURSQUARE_CLIENT_SECRET = "13ETNO1CLGHIOTSPJCUWX0KJ2IE1M3BBW5ZM0PN5530HWMSZ";


/**
 * This function loads data from the FOURSQUARE API
 */
function loadData(){
  var fourSquareUrl = fourSquare();
  var venue = {};
  venueDataInstance.resetObservables();
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      getVenueData(venue);
    })
    .fail(function(err){
      venueDataInstance.error(true);
      venueDataInstance.message('The data cannot be loaded. Check your connection or ' +
        'try again after some time.');
    });
    return false;
}


/**
 * This is a helper function to retrieve information about
 * a venue based on venue id
 * @param {Number} name
 * @returns {Object}
 */
function getVenueData(venue){
  var category = '';
  venueDataInstance.id(venue.id);
  venueDataInstance.error(false);
  venueDataInstance.message("");
  if(venue !== null || venue !== undefined){
    venueDataInstance.name(venue.name);
    if(venue.location.formattedAddress){
      venueDataInstance.address(venue.location.formattedAddress.join(", "));
    }
    if(venue.categories !== null && venue.categories !== undefined){
      $.each(venue.categories, function(index, value){
        category += value.name;
      });
      venueDataInstance.category(category);
    }
    if(venue.url !== null && venue.url !== undefined){
      venueDataInstance.url(venue.url);
    }

    if(venue.contact.formattedPhone !== null && venue.contact.formattedPhone !== undefined){
      venueDataInstance.phone(venue.contact.formattedPhone);
    }
    if(venue.contact.facebook !== null && venue.contact.facebook !== undefined){
      venueDataInstance.facebook("https://fb.com/" + venue.contact.facebook);
    }
    if(venue.contact.facebookUsername !== null && venue.contact.facebookUsername !== undefined){
      venueDataInstance.facebook_name("#" + venue.contact.facebookUsername);
    }
    if(venue.contact.twitter !== null && venue.contact.twitter !== undefined){
      venueDataInstance.twitter("https://twitter.com/" + venue.contact.twitter);
      venueDataInstance.twitter_name("#" + venue.contact.twitter);
    }
    if(venue.categories[0].icon !== null && venue.categories[0].icon !== undefined){
      venueDataInstance.icon(venue.categories[0].icon.prefix + "bg_100" + venue.categories[0].icon.suffix);
    }
    venueDetails(venue.id, 'data');
  }else{
    venueDataInstance.error(true);
    venueDataInstance.message("No data found.");
  }
}


/**
 * This is a helper function to retrieve general information for a venue
 * @param {Array} data
 */
function returnVenue(data){
  var venueDetails = data;
  if(venueDetails !== null && venueDetails !== undefined){
    if(venueDetails.stats !== null && venueDetails.stats !== undefined){
        venueDataInstance.checkins(venueDetails.stats.checkinsCount ? venueDetails.stats.checkinsCount : "N/A");
        venueDataInstance.users(venueDetails.stats.usersCount ? venueDetails.stats.usersCount : "N/A");
        venueDataInstance.visits(venueDetails.stats.visitsCount ? venueDetails.stats.visitsCount : "N/A");
      }

    if(venueDetails.hours !== null && venueDetails.hours !== undefined){
        if(venueDetails.hours.status !== ""  && venueDetails.hours.status !== null && venueDetails.hours.status !== undefined){
          venueDataInstance.status(venueDetails.hours.status);
        }
        if(venueDetails.hours.isOpen !== "" && venueDetails.hours.isOpen !== null && venueDetails.hours.isOpen !== undefined){
          venueDataInstance.isOpen(venueDetails.hours.isOpen);
        }
        if(venueDetails.hours.timeframes[0] !== null && venueDetails.hours.timeframes[0] !== undefined){
          venueDataInstance.time(venueDetails.hours.timeframes[0].days + ": " +
                      venueDetails.hours.timeframes[0].open[0].renderedTime);
        }
      }

    if(venueDetails.ratingColor !== null && venueDetails.ratingColor !== undefined){
      venueDataInstance.ratingColor("#" + venueDetails.ratingColor);
    }
    if(venueDetails.rating !== null && venueDetails.rating !== undefined){
      venueDataInstance.rating(venueDetails.rating);
    }
    if(venueDetails.ratingSignals !== null && venueDetails.ratingSignals !== undefined){
      venueDataInstance.ratingSignals(venueDetails.ratingSignals + " Reviews");
    }
  }
}


/**
 * This function when called loads images for a venue
 */
function loadImages(){
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
        venueImagesInstance.error(true);
        venueImagesInstance.message('The data cannot be loaded. Check your connection or' +
          ' try again after some time.');
    });
    return false;
}


/**
 * This is a helper function to retrieve images for a venue
 * @param {Array} data
 */
function returnVenueImage(data){
  var venueDetails = data;
  var images = [];
  var modalHTML = '';

  venueImagesInstance.error(false);
  venueImagesInstance.message("No user reviews found.");
  venueImagesInstance.images.removeAll();
  if(venueDetails.photos.groups.length !== 0){
    images = venueDetails.photos.groups[0].items;
  }
  if(images.length !== 0){
    $.each(images, function(i, image){
      var obj = {};
      obj.src = image.prefix + '171x180' + image.suffix;
      obj.alt = "Image-" + i;
      venueImagesInstance.images.push(obj);
    });
    $('.col-xs-12 .thumbnail img').click(function(){
      var index = $(this).parents('.col-xs-12').index();
      var src = $(this).attr('src');
      src = src.replace('171x180', '960x720');
      // Create modal body dynamically on each click on the images
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
    venueImagesInstance.error(true);
    venueImagesInstance.message("No images found.");
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
  $('.modal-body img').fadeOut('fast', function () {
    $(this).fadeIn('slow');
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
 * This function when called loads the user tips for a venue
 */
function loadTips(){
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
        venueTipsInstance.error(true);
        venueTipsInstance.message('The data cannot be loaded. Check your connection or' +
          ' try again after some time.');
    });
    return false;
}


/**
 * This function retrieves tips for a venue id
 * @param {Number} venueId
 */
function venueTips(venueId){
  var fourSquareTips = "https://api.foursquare.com/v2/venues/" + venueId + "/tips";
  fourSquareTips += '?' + $.param({
    'v': '20170820',
    'client_id': FOURSQUARE_CLIENT_ID,
    'client_secret': FOURSQUARE_CLIENT_SECRET
  });
  venueTipsInstance.error(false);
  venueTipsInstance.message("");
  venueTipsInstance.tips.removeAll();
  $.getJSON(fourSquareTips)
  .done(function(data){
    var temp = data.response.tips.items;
    if(temp && typeof temp === 'object' && temp.constructor === Array){
      $.each(temp, function(index, val){
        var obj = {};
        obj.prefix = val.user.photo.prefix ? val.user.photo.prefix : "";
        obj.suffix = val.user.photo.suffix ? val.user.photo.suffix: "";
        obj.firstName = val.user.firstName ? val.user.firstName : "";
        obj.lastName = val.user.lastName ? val.user.lastName : "";
        obj.review = val.text ? val.text : "";
        venueTipsInstance.tips.push(obj);
      });
    }
    if(venueTipsInstance.tips().length === 0){
      venueTipsInstance.error(true);
      venueTipsInstance.message("No user reviews found.");
    }
  })
  .fail(function(err){
    venueTipsInstance.error(true);
    venueTipsInstance.message('The data cannot be loaded. Check your connection or' +
      ' try again after some time.');
  });
  return false;
}


/**
 * This function makes initial call to the FOURSQUARE API
 */
function fourSquare(){
  var $markerMore = $("#marker-more");

  var lat_lng = $markerMore.data("position").toString();
  lat_lng = lat_lng.substr(1, lat_lng.length - 2);
  var name = $markerMore.data("title");

  var fourSquareUrl = "https://api.foursquare.com/v2/venues/search";
  fourSquareUrl += '?' + $.param({
    'v': '20170820',
    'll': lat_lng,
    'query': name,
    'client_id': FOURSQUARE_CLIENT_ID,
    'client_secret': FOURSQUARE_CLIENT_SECRET
  });
  return fourSquareUrl;
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
    'client_id': FOURSQUARE_CLIENT_ID,
    'client_secret': FOURSQUARE_CLIENT_SECRET
  });
  $.getJSON(fourSquareVenue)
  .done(function(data){
    if(data.response.venue !== null && data.response.venue !== undefined){
      if(choice === 'data'){
        returnVenue(data.response.venue);
      }else if(choice === 'image'){
        returnVenueImage(data.response.venue);
      }
    }
  })
  .fail(function(err){
    venueDataInstance.error(true);
    venueDataInstance.message('The data cannot be loaded. Check your connection or ' +
     'try again after some time.');
  });
  return false;
}