/*
This file loads any interactions provided by the user and manages their local controls when they've chosen them
*/
console.log("Extension loaded.");

var thisUserID;

//tells whether or not the extension is activated (the controls drop down)
var dropDownShown    = false;
var pickMode         = false;
var currentlyPicking = null;
var appDraft         = {
  site: window.location.host,
  buttons: {
    up: {
      cssPath: null,
      action:   null,
    },
    down: {
      cssPath: null,
      action:   null,
    },
    select: {
      cssPath: null,
      action:   null,
    },
  },
};

var previousElement = null;

var loadID = function (){
    // Save it using the Chrome extension storage API.

    chrome.storage.local.get('userID', function (result) {
        thisUserID = result.userID;
        //user doesn't have an id yet
        if(thisUserID == undefined) {
            console.log("User does not have an id yet. (create on now)");
            // create the local id here
            var uniqueID = Math.floor(Math.random() * 10000);
            console.log("Try to make user with id: " + uniqueID);

            chrome.storage.local.set({'userID': uniqueID}, function() {
                console.log("Successfully created user with ID: " + uniqueID);
            });
            // (create the firebase thing here based on the userID)

        }
        else { //user has an ID, load their firebase settings
            console.log("User has id: " + result.userID);
            // var fb = new Firebase('ADD IN THE LINK TO THE USER'S FIREBASE HERE');// (based on the user id in the chrome instance)

            /* WHEN A USER INPUTS A PEBBLE COMMAND (firebase update)
            fb.endAt().limitToLast(1).on('child_added', function(snapshot) {
                handleMessage(snapshot.val());
            });
            */
        }
    });
}
loadID();

var submitApp = function(){
  // submit to firebase
}

$(document).on('click', '.ctrl-popup span.close', function(e){
  $(e.target).parent().remove();
  $('.ctrl-popup-bg').hide();
  $('.inside-after').remove();
  pickMode = false;
});

$(document).on('click', '.ctrl-popup button.submit', function(e){
  var par = $(e.target).parent();
  submitApp();
  $('.ctrl-popup-bg').hide();
  $('.inside-after').remove();
  par.remove();
  pickMode = false;
});


//hover over elements when the extension is live (for the clicks)
$(document).on('mouseover', function(event) {
    if(!pickMode){
      return;
    }

    if(!$(event.target).hasClass("inside-after")) {
        $('.outlineElement').removeClass('outlineElement');
        if ($(event.target).css('cursor') == 'pointer') {
            var el = parentPointer(event.target);
            $(el).addClass('outlineElement');

           $('.inside-after').remove();

            var newDiv = $('<div class="inside-after"></div>');
            $(el).append(newDiv);
        }
        else {
            $('.inside-after').remove();
        }
    } else {
        $('.inside-after').click(function(event) {
            event.preventDefault();
            console.log($(event.target).parent());
            appDraft.buttons[currentlyPicking].action = 'click';
            appDraft.buttons[currentlyPicking].cssPath = $(event.target).parent().getPath();
            pickMode = false;
            showPopup();
        });
    }
});


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

var loadControlBox = function() {
  showPopup();
}

var initPopup = function(){
  var newHTML = '';

  newHTML += '<div class="popup-bg"></div>'
  // newHTML += '<div class="popup" data-path="' + $(event.target).getPath() + '">';
  newHTML += '<div class="ctrl-popup">';
  newHTML += '<span class="close">✖</span>';
  // newHTML += '<p>' + $(event.target).getPath() + '</p>';
  newHTML += '<div class="pebble-button-list">';
  newHTML += '<p class="up">map to <button data-button="up" class="button button-dark-inverse">up</button></p>';
  newHTML += '<p class="select">map to <button data-button="select" class="button button-dark-inverse">select</button></p>';
  newHTML += '<p class="down">map to <button data-button="down" class="button button-dark-inverse">down</button></p>';
  newHTML += '</div>';
  newHTML += '<button class="submit" style="display:none;">Save App</button>';
  newHTML += '</div>';
  var el = $(newHTML);
  $('body').append(el);
  // pickMode = false;
  $('.ctrl-popup').draggable();
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').hide();
};

var showPopup = function(){
  var currentlyPicking = null;
  var saveReady = false;

  if (appDraft.buttons.up.cssPath !== null){
    $('.ctrl-popup .up').html($('.ctrl-popup .up').html() + '(Will override last mapping)');
    saveReady = true;
  }
  if (appDraft.buttons.select.cssPath !== null){
    $('.ctrl-popup .select').html($('.ctrl-popup .select').html() + '(Will override last mapping)');
    saveReady = true;
  }
  if (appDraft.buttons.down.cssPath !== null){
    $('.ctrl-popup .down').html($('.ctrl-popup .down').html() + '(Will override last mapping)');
    saveReady = true;
  }

  if (saveReady){
    $('.ctrl-popup .submit').show();
  }

  $('.ctrl-popup').show();
  $('.ctrl-popup-bg').show();
}

initPopup();

$(document).on('click', '.pebble-button-list button', function(e){
  var button = $(this).data('button');
  currentlyPicking = button;
  pickMode = true;
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').hide();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  loadControlBox();
});


// Helper Methods
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) {
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

var parentPointer = function(el) {
    if ($(el).parent().css('cursor') == 'pointer') {
        return parentPointer($(el).parent());
    }
    else {
        return el;
    }
}

var getKeyName = function(event) {
    var text = event.key;
    if(event.which == 32) {
        event.preventDefault();
        text = '[space]';
    }
    else if(event.which == 13) {
        event.preventDefault();
        text = '[enter]';
    }

    return text;
}
