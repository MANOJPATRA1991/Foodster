// foursquare client id
var FOURSQUARE_CLIENT_ID = "F1E2HZDPZGHKNSK54DWPNAPW3ADHKL0V0IBHLD1ZN1KPMJNG";

// foursquare client secret
var FOURSQUARE_CLIENT_SECRET = "2HTYTSWFTZUS144ABHWAHAQLVCGQMHTKIONLROWJHOVJCOOF";


/**
 * This function loads data from the FOURSQUARE API
 */
function loadData(lat_lng, name){
  var fourSquareUrl = fourSquare(lat_lng, name);
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
      setTimeout(function() {
        venueDataInstance.error(true);
        venueDataInstance.message('The data cannot be loaded. Check your connection or ' +
          'try again after some time.');
      }, 8000);
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
function loadImages(lat_lng, name){
  var fourSquareUrl = fourSquare(lat_lng, name);
  var venue = {};
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      venueDetails(venue.id, 'image');
    })
    .fail(function(err){
      setTimeout(function() {
        venueImagesInstance.error(true);
        venueImagesInstance.message('The data cannot be loaded. Check your connection or' +
          ' try again after some time.');
      }, 8000);
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
  }else{
    venueImagesInstance.error(true);
    venueImagesInstance.message("No images found.");
  }
}


/**
 * This function when called loads the user tips for a venue
 */
function loadTips(lat_lng, name){
  var fourSquareUrl = fourSquare(lat_lng, name);
  var venue = {};
  $.getJSON(fourSquareUrl)
    .done(function(data){
      if(data.response.venues !== null && data.response.venues !== undefined){
        venue = data.response.venues[0];
      }
      venueTips(venue.id);
    })
    .fail(function(err){
      setTimeout(function() {
        venueTipsInstance.error(true);
        venueTipsInstance.message('The data cannot be loaded. Check your connection or' +
          ' try again after some time.');
      }, 8000);
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
    setTimeout(function() {
      venueTipsInstance.error(true);
      venueTipsInstance.message('The data cannot be loaded. Check your connection or' +
        ' try again after some time.');
    }, 8000);
  });
  return false;
}


/**
 * This function makes initial call to the FOURSQUARE API
 */
function fourSquare(latLng, locName){
  var lat_lng = latLng;
  lat_lng = lat_lng.substr(1, lat_lng.length - 2);
  var name = locName;

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
    setTimeout(function() {
      venueDataInstance.error(true);
      venueDataInstance.message('The data cannot be loaded. Check your connection or ' +
       'try again after some time.');
    }, 8000);
  });
  return false;
}