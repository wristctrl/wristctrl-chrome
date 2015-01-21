/*
This file loads any interactions provided by the user and manages their local controls when they've chosen them
*/
console.log("Extension loaded.");

var uniqueId;

//tells whether or not the extension is activated (the controls drop down)
var dropDownShown    = false;
var pickMode         = false;
var currentlyPicking = null;
var pickingText      = false;
var appDraft         = {
  map: {
    site: window.location.host,
    buttons: {
      up: {
        cssPath: null,
        action:   null
      },
      down: {
        cssPath: null,
        action:   null
      },
      select: {
        cssPath: null,
        action:   null
      }
    }
  },
  text: {
    header: null,
    main: null
  }
};

var previousElement = null;

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
  var submissionAppName = $('.ctrl-popup .ctrl-input').val();
  fb.child(submissionAppName).update(appDraft);
};

$(document).on('click', '.ctrl-popup .ctrl-close', function(e){
  $('.ctrl-popup').hide();
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
  $('.ctrl-popup').hide();
});

//hover over elements when the extension is live (for the clicks)
$(document).on('mouseover', function(event) {
    if(!pickMode){
      return;
    }

    if ($(event.target).children().length > 0){
      return;
    }

    if(!$(event.target).hasClass("inside-after")) {
        $('.outlineElement').removeClass('outlineElement');
        var cursorType = $(event.target).css('cursor');
        if (cursorType == 'pointer' || cursorType == 'auto') {
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
            console.log($(event.target).parent().getPath());
            if (pickingText) {
              appDraft.text[currentlyPicking] = $(event.target).parent().text();
              console.log('Big dicks ' + $(event.target).parent().text());
            }
            else {
              appDraft.map.buttons[currentlyPicking].action = 'click';
              appDraft.map.buttons[currentlyPicking].cssPath = $(event.target).parent().getPath();
            }
            pickMode = false;
            $('.ctrl-popup').removeClass('pick-mode');
            showPopup();
            $('.inside-after').remove();
        });
    }
});

var loadControlBox = function() {
  showPopup();
}

var initPopup = function(){
  var time = new Date();
  var timeString = '';
  var min = time.getMinutes();
  if (min < 10) {
    min = '0' + min;
  }
  if (time.getHours() > 12) {
    timeString += (time.getHours() - 12) + ':' + min + ' PM';
  }
  else {
    timeString += time.getHours() + ':' + min + ' AM';
  }
  console.log('initPopup');
  var newHTML = '';

  newHTML += '<div class="ctrl">';
  newHTML += '<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">';
  newHTML += '<div class="popup-bg"></div>';
  // newHTML += '<div class="popup" data-path="' + $(event.target).getPath() + '">';
  newHTML += '<div class="ctrl-popup">';
  newHTML += '<div class="ctrl-preview-button-top"></div>';
  newHTML += '<div class="ctrl-preview-button-main"></div>';
  newHTML += '<div class="ctrl-preview-button-bottom"></div>';
  newHTML += '<div class="ctrl-preview-button-left"></div>';
  newHTML += '<div class="ctrl-preview">';
  newHTML +=   '<div class="ctrl-preview-header">';
  newHTML +=     '<p class="ctrl-preview-header-time">' + timeString + '</p>';
  newHTML +=   '</div>';
  newHTML +=   '<div class="ctrl-preview-actionbar">';
  newHTML +=     '<p>•</p>';
  newHTML +=     '<p>▸</p>';
  newHTML +=     '<p>◼</p>';
  newHTML +=   '</div>';
  newHTML +=   '<p class="ctrl-preview-top selectable" data-text="header">Click to set</p>';
  newHTML +=   '<p class="ctrl-preview-main selectable" data-text="main">Click to set text text text text blah</p>';
  newHTML +=   '<p class="ctrl-preview-bottom"></p>';
  newHTML += '</div>';
  newHTML += '<div class="ctrl-submit disabled"><i class="fa fa-2x fa-check"></i></div>';
  newHTML += '<div class="ctrl-close"><i class="fa fa-2x fa-close"></i></div>';
  // newHTML += '<p>' + $(event.target).getPath() + '</p>';
  newHTML += '<h1>Name your Controller</h1>';
  newHTML += '<input class="ctrl-input">';
  newHTML += '<div class="pebble-button-list">';
  newHTML += '<p class="up"><button data-button="up" class="ctrl-pebble-button-label">click to configure <span class="accent">"up"</span>&nbsp;</button></p>';
  newHTML += '<p class="select"><button data-button="select" class="ctrl-pebble-button-label">click to configure <span class="accent">"select"</span>&nbsp;</button></p>';
  newHTML += '<p class="down"><button data-button="down" class="ctrl-pebble-button-label">click to configure <span class="accent">"down"</span>&nbsp;</button></p>';
  newHTML += '</div>';
  newHTML += '</div>';
  newHTML += '</div>';
  var el = $(newHTML);
  $('body').append(el);
  $('.ctrl-popup').draggable();
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').hide();
  
  $('.ctrl-input').keyup(function(event) {
    $('.ctrl-preview-bottom').html($(this).val());
  });
};


var showPopup = function(){
  console.log('showPopup');
  var currentlyPicking = null;
  var saveReady = false;
  appDraft.map.site = window.location.host;

  if (appDraft.text.header !== null) {
    $('.ctrl-preview-top').html(appDraft.text.header);
  }

  if (appDraft.text.main !== null) {
    $('.ctrl-preview-main').html(appDraft.text.main);
  }

  if (appDraft.map.buttons.up.cssPath !== null){
    var eName = $(appDraft.map.buttons.up.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.up.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.up.cssPath)[0].getAttribute('title');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        var curr = $(appDraft.map.buttons.up.cssPath);
        while(isEmpty(eName) || isBlank(eName) || eName === null){
            curr = curr.parent();
            if (curr === null){
                break;
            }
            eName = curr.attr('class');
            console.log(eName);
        }
    }
    $('.ctrl-popup .up').html('configured to <span class="action">' + eName + '</span>');
    // $('.ctrl-popup .up').html($('.ctrl-popup .up').html() + '(Will override last mapping)');
    saveReady = true;
  }
  if (appDraft.map.buttons.select.cssPath !== null){
    var eName = $(appDraft.map.buttons.select.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.select.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.select.cssPath)[0].getAttribute('title');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        var curr = $(appDraft.map.buttons.select.cssPath);
        while(isEmpty(eName) || isBlank(eName) || eName === null){
            curr = curr.parent();
            if (curr === null){
                break;
            }
            eName = curr.attr('class');
        }
    }
    $('.ctrl-popup .select').html('configured to <span class="action">' + eName + '</span>');
    saveReady = true;
  }
  if (appDraft.map.buttons.down.cssPath !== null){
    var eName = $(appDraft.map.buttons.down.cssPath)[0].innerText;
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.down.cssPath)[0].getAttribute('aria-label');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        eName = $(appDraft.map.buttons.down.cssPath)[0].getAttribute('title');
    }
    if (isEmpty(eName) || isBlank(eName) || eName === null) {
        var curr = $(appDraft.map.buttons.down.cssPath);
        while(isEmpty(eName) || isBlank(eName) || eName === null){
            curr = curr.parent();
            if (curr === null){
                break;
            }
            eName = curr.attr('class');
        }
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
  pickingText = false;
  pickMode = true;
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').addClass('pick-mode');
});

$(document).on('click', '.ctrl-preview-main, .ctrl-preview-top', function(event) {
  currentlyPicking = $(this).data('text');
  pickingText = true;
  pickMode = true;
  $('.ctrl-popup-bg').hide();
  $('.ctrl-popup').addClass('pick-mode');
});

// Pebble emulator button animations
$('.pebble-button-list .up').hover(function() {
  $('.ctrl-popup .ctrl-preview-button-top').stop().animate({width: '6px'}, 100);
}, function() {
  $('.ctrl-popup .ctrl-preview-button-top').stop().animate({width: '12px'}, 100);
});

$('.pebble-button-list .select').hover(function() {
  $('.ctrl-popup .ctrl-preview-button-main').stop().animate({width: '6px'}, 100);
}, function() {
  $('.ctrl-popup .ctrl-preview-button-main').stop().animate({width: '12px'}, 100);
});

$('.pebble-button-list .down').hover(function() {
  $('.ctrl-popup .ctrl-preview-button-bottom').stop().animate({width: '6px'}, 100);
}, function() {
  $('.ctrl-popup .ctrl-preview-button-bottom').stop().animate({width: '12px'}, 100);
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if(request['action'] == 'launchControlBox') {
    loadControlBox();
  } else if (request['action'] == 'redirectToMarketplace') {
    var win = window.open('http://wristctrl.com/marketplace', '_blank');
    win.focus();
  } else if(Object.keys(request)[0] == 'uniqueId') {
    uniqueId = request['uniqueId'];
    localStorage.setItem("ctrl-uniqueId", uniqueId);
  }
});

var loadContentScript = function() {
  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + uniqueId);

  var getLastCommand = function(appData) {
    var arr = Object.keys(appData['commands']);
    var key = arr[arr.length - 1];
    return appData['commands'][key];
  };

  var execFireAction = function(cssPath, action){
    if (action === 'click'){
      $(cssPath).click();
    } else if (action === 'raw_js'){
      window.eval(cssPath);
    }
  }

  var commandListener = function() {
    fb.orderByPriority().on("child_changed", function(snapshot) {
      var appData = snapshot.val();
      var lastCommand = getLastCommand(appData);
      var site = appData['map']['site'];
      var cssPath = appData['map']['buttons'][lastCommand]['cssPath'];
      var action = appData['map']['buttons'][lastCommand]['action'];

      execFireAction(cssPath, action);
    });
  };

  commandListener();
};

uniqueId = localStorage.getItem("ctrl-uniqueId");

// wait until we hear from the popup with the uniqueId.
(function wait() {
  if(uniqueId != null){
    loadContentScript();
  } else {
    setTimeout(wait, 500);
  }
})();

