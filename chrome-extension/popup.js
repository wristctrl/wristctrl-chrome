console.log('popup.js');

var fb;

// fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + 'SQYBBY');

$(function() {
  console.log('ready');

  $('.ctrl-checkbox').click(function(event) {
    if ($(this).hasClass('ctrl-checked')) {
      $(this).removeClass('ctrl-checked');
      $(this).addClass('ctrl-unchecked');
      $('.ctrl-menu').removeClass('developer-mode');
    }
    else {
      $(this).addClass('ctrl-checked');
      $(this).removeClass('ctrl-unchecked');
      $('.ctrl-menu').addClass('developer-mode');
    }
  });

  $('#ctrl-build').on('click', function() {
    window.close();
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
      chrome.tabs.sendMessage(tabs[0].id, {action: "launchControlBox"});
    });
  });

  loadID();

});

var loadAppMenu = function(uniqueId) {
  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + uniqueId);

  $("#ctrl-uniqueId").text(uniqueId);

  chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
    chrome.tabs.sendMessage(tabs[0].id, {'uniqueId': uniqueId});
  });
};

var createFireNode = function(uniqueId) {
};

var loadID = function (){
  var uniqueID = null;

  // Save it using the Chrome extension storage API.
  chrome.storage.local.get('userID', function (result) {
    thisUserID = result.userID;

    //user doesn't have an id yet
    if(thisUserID == undefined) {

      // create the local id here
      uniqueID = genId(6);

      // console.log("Try to make user with id: " + uniqueID);

      chrome.storage.local.set({'userID': uniqueID}, function() {
        // console.log("Successfully created user with ID: " + uniqueID);
      });

      loadAppMenu(uniqueID);
    }
    else { //user has an ID, load their firebase settings
      // console.log("User has id: " + result.userID);
      uniqueID = result.userID;
      loadAppMenu(uniqueID);
    }
  });
}

var genId = function(len) {
  var text = "";

  var charset = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

  for( var i=0; i < len; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return text;
}

////// angular /////////
var app = angular.module("popup", ["firebase"]);

app.controller("appCtrl", function($scope, $firebase) {

  setTimeout(function() {
    var sync = $firebase(fb);

    $scope.messages = sync.$asArray();
  }, 100);

});
