/**
 * This function is our model for venue data
 */
function VenueDataModel(){
  var self = this;
  self.id = ko.observable();
  self.name = ko.observable();
  self.address = ko.observable();
  self.category = ko.observable();
  self.url = ko.observable();
  self.phone = ko.observable();
  self.facebook = ko.observable();
  self.facebook_name = ko.observable();
  self.twitter = ko.observable();
  self.twitter_name = ko.observable();
  self.checkins = ko.observable();
  self.users = ko.observable();
  self.visits = ko.observable();
  self.icon = ko.observable();
  self.ratingColor = ko.observable();
  self.rating = ko.observable();
  self.ratingSignals = ko.observable();
  self.status = ko.observable();
  self.isOpen = ko.observable(false);
  self.time = ko.observable();
  self.timeVisible = ko.observable(false);
  self.toggleTime = function() {
    self.timeVisible(!self.timeVisible());
  };
  self.error = ko.observable(false);
  self.message = ko.observable("");

  self.resetObservables = function() {
    for (var key in self) {
      if (self.hasOwnProperty(key) && ko.isWriteableObservable(self[key])) {
        if(key === 'error' || key === 'timeVisible' || key === 'isOpen'){
          self[key](false);
        }else{
          self[key]("");
        }
      }
    }
  };
}

// Apply binding to element with id menu-panel
var venueDataInstance = new VenueDataModel();
ko.applyBindings(venueDataInstance, document.getElementById("menu-panel"));


/**
 * This function is our model for venue images
 */
function VenueImagesModel(){
  var self = this;
  self.images = ko.observableArray();
  self.error = ko.observable(false);
  self.message = ko.observable("");
}

// Apply binding to element with id photo-panel
var venueImagesInstance = new VenueImagesModel();
ko.applyBindings(venueImagesInstance, document.getElementById("photo-panel"));


/**
 * This function is our model for venue tips
 */
function VenueTipsModel(){
  var self = this;
  self.tips = ko.observableArray();
  self.error = ko.observable(false);
  self.message = ko.observable("");
}

// Apply binding to element with id left-panel
var venueTipsInstance = new VenueTipsModel();
ko.applyBindings(venueTipsInstance, document.getElementById("left-panel"));


/**
 * This function is our model for signing up users
 */
function SignUpModel(){

  var self = this;
  self.userName = ko.observable()
                  .extend({ required: true, minLength: 8, maxLength:17})
                  .publishOn("currentUser");
  self.userId = ko.observable().publishOn("currentUserId");
  self.userPassword = ko.observable('').extend({ required: true, minLength: 8, maxLength:17});
  self.email = ko.observable('').extend({ required: true });
  self.rePassword = ko.observable('').extend({ required: true, minLength: 8, maxLength:17});
  self.message = ko.observable();
  self.isLoggedIn = ko.observable(false).publishOn("isLoggedIn");

  /**
   * This function is used for signing up users
   */
  self.signUp = function(){
    if (self.email() !== "" && self.userPassword() !== "" &&
      self.userPassword() === self.rePassword()){
      console.log(true);
      firebase.auth().createUserWithEmailAndPassword(self.email(), self.userPassword())
      .then(function(){
        console.log("success");
        self.isLoggedIn(true);
        var user = firebase.auth().currentUser;
        if (user !== null){
          user.updateProfile({
            displayName: self.userName()
          });
          self.userId(user.uid);
          user.providerData.forEach(function (profile) {
            self.userName(profile.displayName);
          });
        }
        // Hide the sign up modal
        $("#sign-up-modal").modal('hide');
      }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/argument-error'){
          if(self.email === ""){
            self.message("Please enter a valid email.");
          }else if(self.userPassword === ""){
            self.message("Please enter a valid password.");
          }
        }else if(errorCode === 'auth/email-already-in-use'){
          self.message("Email already in use. Continue to log in.");
        }else if(errorCode === 'auth/invalid-email'){
          self.message("Invalid email address. Please check again.");
        }else if(errorCode === 'auth/weak-password'){
          self.message("Password not strong enough");
        }
      });
    }else{
      self.message("Please ensure these before sign up. " +
        "1. Email and Password fields cannot be empty. 2. Passwords should match!");
    }
  };

  $('#sign-up-modal').on('hidden.bs.modal', function(){
      self.message("");
  });
}

// Apply binding to element with id sign-up-modal
ko.applyBindings(new SignUpModel(), document.getElementById("sign-up-modal"));


/**
 * This function is our model for logging in users
 */
function LogInModel(){
  self.email = ko.observable('');
  self.password = ko.observable('');
  self.userName = ko.observable().publishOn("currentUser");
  self.userId = ko.observable().publishOn("currentUserId");
  self.isLoggedIn = ko.observable(false).publishOn("isLoggedIn");
  self.message = ko.observable();
  self.favLocations = ko.observableArray().publishOn("FavArray");
  /**
   * This function logs in the user
   */
  self.logIn = function(){
    if(self.email() !== '' && self.password() !== ''){
      firebase.auth().signInWithEmailAndPassword(self.email(), self.password())
      .then(function(){
        var user = firebase.auth().currentUser;
        self.isLoggedIn(true);
        if (user !== null) {
          self.userId(user.uid);
          console.log(self.userId());
          user.providerData.forEach(function (profile) {
            self.userName(profile.displayName);
          });
        }
        // Hide the log in modal
        $("#log-in-modal").modal('hide');
      }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/invalid-email'){
          self.message("Please try again with a valid email address.");
        }else if(errorCode === 'auth/user-not-found'){
          self.message("No user exists for the email provided. Sign up to continue.");
        }else if(errorCode === 'auth/wrong-password'){
          self.message("Incorrect password. Try again.");
        }
      });
    }else{
      self.message("Email/Password should not be blank.");
    }
  };

  /**
   * This function logs out the user
   */
  self.logOut = function(){
    firebase.auth().signOut().then(function() {
      self.isLoggedIn(false);
      self.userName("");
      self.favLocations([]);
    });
  };

  $('#log-in-modal').on('hidden.bs.modal', function(){
      self.message("");
  });
}

// Apply binding to element with id log-in-modal
ko.applyBindings(new LogInModel(), document.getElementById("log-in-modal"));


/**
 * This function is our model for user's favorite places
 */
function favoritesModel(){
  self.user = ko.observable().subscribeTo("currentUserId");
  self.favLocations = ko.observableArray().publishOn("FavArray");
  self.noFavs = ko.observable(false);

  // Action on opening the my-places-modal modal
  $('#my-places-modal').on('shown.bs.modal', function(){
    console.log(self.userId());
    if(self.user() !== undefined){
      // Sync changes
      firebase.database().ref().child('/users/' + self.user() + '/favorites/').on('value', function(snap){
        self.favLocations([]);
        if(snap !== null){
          snap.forEach(function(childSnap){
            var childKey = childSnap.key;
            var childObj = childSnap.val();
            var location = {
              title: childObj.title,
              location: {
                lat: parseFloat(childObj.lat),
                lng: parseFloat(childObj.lng)
              }
            };
            self.favLocations.push(location);
          });
          console.log(self.favLocations());
        }else{
          self.noFavs(true);
        }
      });
    }
  });


  self.closePlaces = function(){
    var elem = this.title;
    console.log(elem);
    firebase.database().ref().child('/users/' + self.userId() + '/favorites/').once('value', function(snap){
      // remove data if it exists in the database
      if(snap.hasChild(elem)) {
        var updates = {};
        updates['/users/' + self.userId() + '/favorites/' +  elem] = null;
        firebase.database().ref().update(updates);
      }
    });
  };
}

// Apply binding to element with id my-places-modal
ko.applyBindings(new favoritesModel(), document.getElementById("my-places-modal"));