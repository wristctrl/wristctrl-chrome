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

//controls harnessing key events
//example usage: Podium.keyEvent(32, "keydown");
Podium = {};
Podium.keyEvent = function(key, pressType) {
    var oEvent = document.createEvent('KeyboardEvent');

    // Chromium Hack
    Object.defineProperty(oEvent, 'keyCode', {
        get : function() {
            return this.keyCodeVal;
        }
    });
    Object.defineProperty(oEvent, 'which', {
        get : function() {
            return this.keyCodeVal;
        }
    });

    if (oEvent.initKeyboardEvent) {
        oEvent.initKeyboardEvent(pressType, true, true, document.defaultView, false, false, false, false, key, key);
    } else {
        oEvent.initKeyEvent(pressType, true, true, document.defaultView, false, false, false, false, key, 0);
    }

    oEvent.keyCodeVal = key;

    if (oEvent.keyCode !== key) {
        alert("keyCode mismatch " + oEvent.keyCode + "(" + oEvent.which + ")");
        console.log("Key code mismatch.");
    }

    //$('*').focus();
    //^^^^ *NEED TO FIND WHICH ELEMENT TO FOCUS WHEN DOING KEY CONTROLS?!
    //$('*').preventDefault();
    document.dispatchEvent(oEvent);
}

var submitApp = function() {
  console.log('submit');
  console.log(JSON.stringify(appDraft));

  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + thisUserID);

  fb.child('youtube').child('map').update(appDraft);
};

$(document).on('click', '.ctrl-popup .ctrl-close', function(e){
  $(e.target).parent().remove();
  $('.ctrl-popup-bg').hide();
  $('.inside-after').remove();
  pickMode = false;
});

$(document).on('click', '.ctrl-popup .ctrl-submit', function(e){
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
            // $(event.target).css('cursor', 'not-allowed');
        }
    } else {
        $('.inside-after').click(function(event) {
            event.preventDefault();
            console.log($(event.target).parent());
            appDraft.buttons[currentlyPicking].action = 'click';
            appDraft.buttons[currentlyPicking].cssPath = $(event.target).parent().getPath();
            pickMode = false;
            showPopup();
            $('.inside-after').remove();
        });
    }
});

var loadControlBox = function() {
  showPopup();
}

var initPopup = function(){
  console.log('initPopup');
  var newHTML = '';

  newHTML += '<div class="popup-bg"></div>'
  // newHTML += '<div class="popup" data-path="' + $(event.target).getPath() + '">';
  newHTML += '<div class="ctrl-popup">';
  newHTML += '<div class="ctrl-submit disabled">&check;</div>';
  newHTML += '<div class="ctrl-close">✖</div>';
  // newHTML += '<p>' + $(event.target).getPath() + '</p>';
  newHTML += '<h1>Name your Controller</h1>'
  newHTML += '<input class="ctrl-input">';
  newHTML += '<div class="pebble-button-list">';
  newHTML += '<p class="up">map action for <button data-button="up" class="ctrl-button ctrl-button-dark-inverse">up</button></p>';
  newHTML += '<p class="select">map action for <button data-button="select" class="loose ctrl-button ctrl-button-dark-inverse">select</button></p>';
  newHTML += '<p class="down">map action for <button data-button="down" class="loose ctrl-button ctrl-button-dark-inverse">down</button></p>';
  newHTML += '</div>';
  newHTML += '</div>';
  var el = $(newHTML);
  $('body').append(el);
  $('.ctrl-popup').draggable();
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').hide();
};

var showPopup = function(){
  console.log('showPopup');
  var currentlyPicking = null;
  var saveReady = false;

  if (appDraft.buttons.up.cssPath !== null){
    var eName = $(appDraft.buttons.up.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.up.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.up.cssPath)[0].getAttribute('title');
    }
    $('.ctrl-popup .up').html('configured to <span class="action">' + eName + '</span>');
    // $('.ctrl-popup .up').html($('.ctrl-popup .up').html() + '(Will override last mapping)');
    saveReady = true;
  }
  if (appDraft.buttons.select.cssPath !== null){
    var eName = $(appDraft.buttons.select.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.select.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.select.cssPath)[0].getAttribute('title');
    }
    $('.ctrl-popup .select').html('configured to <span class="action">' + eName + '</span>');
    saveReady = true;
  }
  if (appDraft.buttons.down.cssPath !== null){
    var eName = $(appDraft.buttons.down.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.down.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName)) {
        eName = $(appDraft.buttons.down.cssPath)[0].getAttribute('title');
    }
    $('.ctrl-popup .down').html('configured to <span class="action">' + eName + '</span>');
    saveReady = true;
  }

  if (saveReady){
    $('.ctrl-popup .ctrl-submit').removeClass('disabled');
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  console.log('got a message on pebble-actions.js ' + JSON.stringify(request));
  if(request['action'] == 'launchControlBox') {
    console.log('launch box');
    loadControlBox();
  } else if(Object.keys(request)[0] == 'uniqueId') {
    console.log('uniqueId request');
    thisUserID = request['uniqueId'];
    commandListener();
  }

});

var commandListener = function() {
  console.log('CommandListener begins');

  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + thisUserID);

  fb.orderByPriority().on("child_changed", function(snapshot) {
    var commandData = snapshot.val();
    console.log(JSON.stringify(commandData));
  });
  // var first = true; // so we don't get one unless it's new

  // fb.on('value', function(snapshot) {
  // fb.on('child_changed', function(snapshot) {
  //   // return snapshot
  //   // if(!first) {
  //     // handleMessage(snapshot.val());
  //     console.log('Key: ' + snapshot.key());
  //     console.log('Snapshot :' + JSON.stringify(snapshot.val()));
  //   // } else {
  //   //   first = false;
  //   // }
  // });
};

commandListener();

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
