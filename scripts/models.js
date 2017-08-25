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
  }
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

var venueTipsInstance = new VenueTipsModel();
ko.applyBindings(venueTipsInstance, document.getElementById("left-panel"));


function SignUpModel(){
  var self = this;
  self.userName = ko.observable()
                  .extend({ required: true, minLength: 8, maxLength:17})
                  .publishOn("currentUser");
  self.userPassword = ko.observable().extend({ required: true, minLength: 8, maxLength:17});
  self.email = ko.observable();
  self.rePassword = ko.observable().extend({ required: true, minLength: 8, maxLength:17});
  self.message = ko.observable();
  self.isLoggedIn = ko.observable(false).publishOn("isLoggedIn");
  self.signUp = function(){
    if (self.userPassword() !== "" && self.rePassword() !== "" &&
      self.userPassword() === self.rePassword()){
      console.log(true);
      firebase.auth().createUserWithEmailAndPassword(self.email(), self.userPassword())
      .then(function(){
        console.log("success");
        self.isLoggedIn(true);
        var user = firebase.auth().currentUser;
        if (user != null){
          user.updateProfile({
            displayName: self.userName()
          });
        }
        console.log("Login Successful");
      }, function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if(errorCode === 'auth/email-already-in-use'){
          self.message("Email already in use. Continue to log in.");
        }else if(errorCode === 'auth/invalid-email'){
          self.message("Invalid email address. Please check again.");
        }else if(errorCode === 'auth/weak-password'){
          self.message("Password not strong enough")
        }
      });
    }else{
      self.message = "Passwords don't match!";
    }
  }
}

ko.applyBindings(new SignUpModel(), document.getElementById("sign-up-modal"));

function LogInModel(){
  self.email = ko.observable();
  self.password = ko.observable();
  self.userName = ko.observable().publishOn("currentUser");
  self.isLoggedIn = ko.observable(false).publishOn("isLoggedIn");
  self.message = ko.observable();
  self.logIn = function(){
    firebase.auth().signInWithEmailAndPassword(self.email(), self.password())
    .then(function(){
      var user = firebase.auth().currentUser;
      self.isLoggedIn(true);
      if (user != null) {
        user.providerData.forEach(function (profile) {
          self.userName(profile.displayName);
        });
      }
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
  }
  self.logOut = function(){
    firebase.auth().signOut().then(function() {
      self.isLoggedIn(false);
      self.userName("");
    });
  }
}

ko.applyBindings(new LogInModel(), document.getElementById("log-in-modal"));
