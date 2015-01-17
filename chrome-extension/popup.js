console.log('popup.js');

var fb;

$(function() {
  console.log('ready');

  $('button').on('click', function() {
    console.log('clicked');

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
      chrome.tabs.sendMessage(tabs[0].id, {action: "launchControlBox"});
    });
  });

  loadID();

});

var loadAppMenu = function(uniqueId) {
  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + uniqueId);

  console.log(uniqueId);

  fb.on('value', function(snapshot) {
    var data = snapshot.val();

    console.log(data);

    if(data != null) {
      console.log('udateAppMenu value:' + JSON.stringify(Object.keys(data)));

      var apps = Object.keys(data);

      console.log(apps);
    }
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
