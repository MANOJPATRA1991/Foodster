# Foodster

A single-page application featuring a map of my neigborhood with additional functionality developed as part of Udacity's [Full Stack Web Developer Nanodegree Program](https://in.udacity.com/course/full-stack-web-developer-nanodegree--nd004/). 

## Table of Contents
  1. [Description](#description)
  2. [Reference](#reference)
  3. [License](#license)

### Description

An interactive website to filter and search for restaurants in the city of Bengaluru. General information, user tips and images for the venue are displayed with the help of FourSquare API. The website has been tested for responsiveness across various devices.

Features implemented in this project include:

  1. [Google Map](https://developers.google.com/maps/) Implementation
  2. Use of [FOURSQUARE](https://developer.foursquare.com/) API to include information about a place
  3. Use of [Google Directions](https://developers.google.com/maps/documentation/directions/) API to display directions between default marker and various nearby places
  4. Implementation of [FIREBASE](https://firebase.google.com/) Authentication System
  5. Enable Logged in users to add/delete places to their favorites list (to [FIREBASE](https://firebase.google.com/docs/database/) real-time database)
  6. List based display of default markers
  7. Implementation of text based filters and rating sliding filters
  8. Show nearby places for a default marker
  
##### To run this project in local environment:
  1. Clone the repo.
  2. Run `bower install` from within the project folder in cmd to install the dependencies.
  3. Install **simplehttpserver** with the following command to run the project locally:
      `npm install simplehttpserver -g`
  4. Also, check your host and port number and if they are different from **localhost** and **8000** (default), change them at respective places in **app.js** as well as in **models.js** files.
  5. Move into your project directory and run `simplehttpserver` from the command line.
  5. Now open **http://localhost:8000/** from any web browser or simply double click on index.html to open the project in the browser.
    > The simplehttpserver is required to load the json files.
  6. To debug on Android: 
      1. Connect your device via USB to your computer. 
      2. Then enable USB Debugging on the device and run **adb start-server** from command prompt on computer. 
      3. Now move to Chrome (if you want to use other browsers, make sure to check how to debug through their documentation) and type            **chrome://inspect** in the address bar. Then set Port and IP Address and port in Port Forwarding settings. 
      4. Now install **simplehttpserver** by running the command `npm install simplehttpserver -g` from the command prompt. Once       installed run the command `simplehttpserver` from within the project directory in cmd which will start up the server thus, enabling us to debug on Android devices.
      5. Now go to **http://localhost:8000/** to check the project on your android device.

### Reference

  1. [Bootstrap](http://getbootstrap.com/)
  2. [jQuery](https://jquery.com/)
  3. [W3Schools](https://www.w3schools.com/)
  4. [Markup Validation](https://validator.w3.org/)
  5. [CSS3 Validation](https://jigsaw.w3.org/css-validator/)
  6. [Responsive Images](https://www.udacity.com/course/responsive-images--ud882)
  7. [Responsive Web Design fundamental](https://www.udacity.com/course/responsive-web-design-fundamentals--ud893)
  8. [KnockoutJS](http://knockoutjs.com/)
  9. [Knockout Postbox](https://github.com/rniemeyer/knockout-postbox)
  10. [Google Maps API](https://developers.google.com/maps/)
  11. [JSHint](jshint.com)
  12. [JSONLint](https://jsonlint.com/)
  
### License

The content of this repository is licensed under [MIT](https://choosealicense.com/licenses/mit/).
