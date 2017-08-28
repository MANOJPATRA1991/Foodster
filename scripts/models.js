/**
 * This function is our model for venue data
 */
function VenueDataViewModel(){
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
var venueDataInstance = new VenueDataViewModel();
ko.applyBindings(venueDataInstance, document.getElementById("menu-panel"));


/**
 * This function is our model for venue images
 */
function VenueImagesViewModel(){
  var self = this;
  self.images = ko.observableArray().syncWith("ImageArray");
  self.error = ko.observable(false);
  self.message = ko.observable("");
  self.index = ko.observable().syncWith("Index");
  self.src = ko.observable().syncWith("Image");
  self.openImageModal = function(){
    self.index(self.images.indexOf(this));
    var src = this.src.replace('171x180', '960x720');;
    self.src(src);
    console.log(self.index());
  };
}

// Apply binding to element with id photo-panel
var venueImagesInstance = new VenueImagesViewModel();
ko.applyBindings(venueImagesInstance, document.getElementById("photo-panel"));


/**
 * This function is our model for modal images
 */
 function ModalImagesViewModal(){
  self.modalSrc = ko.observable().syncWith("Image");
  self.index = ko.observable().syncWith("Index");
  self.next = ko.observable();
  self.prev = ko.observable();
  self.images = ko.observableArray().syncWith("ImageArray");

  $("#modalImages").on('shown.bs.modal', function(){
    console.log(self.modalSrc());
    self.next(self.index() + 2);
    self.next(self.index());
    var newPrevIndex = parseInt(self.next()) - 1;
    var newNextIndex = parseInt(newPrevIndex) + 2;
    if(self.next() !== self.images().length){
      self.prev(newPrevIndex);
      self.next(newNextIndex);
    }else if(self.prev() >= 0){
      self.prev(newPrevIndex);
      self.next(newNextIndex);
    }
  });

  // change previous
  self.changeNext = function(){
    var newPrevIndex = parseInt(self.next()) - 1;
    var newNextIndex = parseInt(newPrevIndex) + 2;
    if(self.next() !== self.images().length){
      self.modalSrc(self.images()[self.next()]
      .src.replace('171x180', '960x720'));
      self.prev(newPrevIndex);
      self.next(newNextIndex);
    }
  };
  // change next
  self.changePrev = function(){
    var newPrevIndex = parseInt(self.prev()) - 1;
    var newNextIndex = parseInt(newPrevIndex) + 2;
    if(self.prev() >= 0){
      self.modalSrc(self.images()[self.prev()]
      .src.replace('171x180', '960x720'));
      self.prev(newPrevIndex);
      self.next(newNextIndex);
    }
  };
 }

 $("#modalImages").on('hidden.bs.modal', function(){
  self.modalSrc("");
 });

 ko.applyBindings(new ModalImagesViewModal(), document.getElementById("modalImages"));

/**
 * This function is our model for venue tips
 */
function VenueTipsViewModel(){
  var self = this;
  self.tips = ko.observableArray();
  self.error = ko.observable(false);
  self.message = ko.observable("");
}

// Apply binding to element with id left-panel
var venueTipsInstance = new VenueTipsViewModel();
ko.applyBindings(venueTipsInstance, document.getElementById("left-panel"));


/**
 * This function is our model for signing up users
 */
function SignUpViewModel(){

  var self = this;
  self.userName = ko.observable()
                  .extend({ required: true, minLength: 8, maxLength:17})
                  .publishOn("currentUser");
  self.userId = ko.observable().publishOn("currentUserId");
  self.userPassword = ko.observable('').extend({ required: true, minLength: 8, maxLength:17});
  self.email = ko.observable('').extend({ required: true });
  self.rePassword = ko.observable('').extend({ required: true, minLength: 8, maxLength:17});
  self.message = ko.observable();
  self.isLoggedIn = ko.observable(false).syncWith("isLoggedIn");

  /**
   * This function is used for signing up users
   */
  self.signUp = function(){
    if (self.email() !== "" && self.userPassword() !== "" &&
      self.userPassword() === self.rePassword()){
      firebase.auth().createUserWithEmailAndPassword(self.email(), self.userPassword())
      .then(function(){
        self.isLoggedIn(true);
        self.userName(self.userName());
        var user = firebase.auth().currentUser;
        if (user !== null){
          user.updateProfile({
            displayName: self.userName()
          });
          self.userId(user.uid);
        }
        // Hide the sign up modal
        $("#sign-up-modal").modal('hide');
      }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
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
ko.applyBindings(new SignUpViewModel(), document.getElementById("sign-up-modal"));


/**
 * This function is our model for logging in users
 */
function LogInViewModel(){
  self.email = ko.observable('');
  self.password = ko.observable('');
  self.userName = ko.observable().publishOn("currentUser");
  self.userId = ko.observable().publishOn("currentUserId");
  self.isLoggedIn = ko.observable(false).syncWith("isLoggedIn");
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
          user.providerData.forEach(function (profile) {
            self.userName(profile.displayName);
          });
        }
        // Hide the log in modal
        $("#log-in-modal").modal('hide');
      }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
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
        console.log(self.isLoggedIn());
        self.isLoggedIn(false);
        self.userName("");
        self.favLocations([]);
        // when user is logged out, reload the web app
        window.open('https://manojpatra1991.github.io/Foodster/', "_self");
    });
  };

  $('#log-in-modal').on('hidden.bs.modal', function(){
      self.message("");
  });
}

// Apply binding to element with id log-in-modal
ko.applyBindings(new LogInViewModel(), document.getElementById("log-in-modal"));


/**
 * This function is our model for user's favorite places
 */
function favoritesViewModel(){
  self.user = ko.observable().subscribeTo("currentUserId");
  self.favLocations = ko.observableArray().publishOn("FavArray");
  self.noFavs = ko.observable(false);

  // Action on opening the my-places-modal modal
  $('#my-places-modal').on('shown.bs.modal', function(){
    if(self.user() !== undefined){
      // Sync changes
      firebase.database().ref().child('/users/' + self.user() + '/favorites/').on('value', function(snap){
        self.favLocations([]);
        if(snap !== null){
          snap.forEach(function(childSnap){
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
          if(self.favLocations().length === 0){
              self.noFavs(true);
          }else{
              self.noFavs(false);
          }
        }
      });
    }
  });


  self.removePlaces = function(){
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
    if(self.favLocations().length === 0){
        self.noFavs(true);
    }else{
        self.noFavs(false);
    }
  };
}

// Apply binding to element with id my-places-modal
ko.applyBindings(new favoritesViewModel(), document.getElementById("my-places-modal"));