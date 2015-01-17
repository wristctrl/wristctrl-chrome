/*
This file loads any interactions provided by the user and manages their local controls when they chose them
*/

//var userID = '1234'; //TO BE STORED IN THE CHROME INSTANCE

//var fb = new Firebase('ADD IN THE LINK TO THE USER'S FIREBASE HERE');

var first = true; // so we don't get one unless it's new

/* WHEN A USER INPUTS A PEBBLE COMMAND
fb.endAt().limitToLast(1).on('child_added', function(snapshot) {
    if(!first) {
        handleMessage(snapshot.val());
    } else {
        first = false;
    }
});
*/

//handles the message - does a command from the fb based on the key
var handleMessage = function(data) {
    var msg = data.message;
    switch(msg) {
        case "up":
            
            break;
        case "select":

            break;
        case "down":

            break;
        default:
            console.log("Sorry, that message isn't recognized. (Is that even a pebble button?!)");
            break;
    }
};
//$('#').click();
