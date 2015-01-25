/*
This file loads any interactions provided by the user and manages their local controls when they've chosen them
*/
console.log("Extension loaded.");

var uniqueId;
var currentPlugin;

//tells whether or not the extension is activated (the controls drop down)
var dropDownShown    = false;
var pickMode         = false;
var currentlyPicking = null;
var pickingText      = false;

var appDraft         = {
  map: {
    site: null,
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
    header: {
      cssPath: null,
      content: null
    },
    main: {
      cssPath: null,
      content: null
    }
  }
};

var getSite = function() {
  var a = domainatrix.parse(window.location.host);
  return a.domain + '.' + a.publicSuffix;
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
        }
    } else {
        $('.inside-after').click(function(event) {
            event.preventDefault();
            console.log($(event.target).parent().getPath());
            if (pickingText) {
              appDraft.text[currentlyPicking]['cssPath'] = $(event.target).parent().getPath();
              appDraft.text[currentlyPicking]['content'] = $(appDraft.text[currentlyPicking]['cssPath']).text();
            } else {
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
  appDraft.map.site = getSite();

  if(appDraft.text.header.content !== null) {
    $('.ctrl-preview-top').html(appDraft.text.header.content);
  }

  if(appDraft.text.main.content !== null) {
    $('.ctrl-preview-main').html(appDraft.text.main.content);
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
  } else if(Object.keys(request)[0] == 'launchSite') {
    var site = 'http://' + request['launchSite'];
    var win = window.open(site, '_blank');
    win.focus();
  } else if(request['action'] == 'pushState') {
    console.log('pushState');
    setTimeout(getAndSetPebbleText, 500);
  }
});

var trim = function(str) {
  var strWithoutWhiteSpace = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  return strWithoutWhiteSpace.substring(0, 63); // max size on pebble
}

var execFireAction = function(cssPath, action){
  if (action === 'click'){
    $(cssPath).click();
  } else if (action === 'raw_js'){
    window.eval(cssPath);
  }
}

var onCorrectSite = function (target) {
  if(target == '*') {
    return true;
  } else if(target == getSite()) {
    return true;
  } else {
    return false;
  }
}

var commandListener = function() {
  var first = true;
  console.log('here2 ' + currentPlugin);
  fb.child('plugins').child(currentPlugin).child('commands').limitToLast(1).on("child_added", function(snapshot) {
    if(!first) {
      var lastCommand = snapshot.val();

      fb.child('plugins').child(currentPlugin).child('map').once('value', function(snapshot2) {
        var map = snapshot2.val();
        var site = map['site'];
        var cssPath = map['buttons'][lastCommand]['cssPath'];
        var action = map['buttons'][lastCommand]['action'];

        console.log('here');
        if (onCorrectSite(site)){
          console.log('Execing action: ' + action + ', path: ' + cssPath);
          execFireAction(cssPath, action);
        }
      });
    } else {
      first = false;
    }
  });
};

var getCurrentPlugin = function() {
  fb.child('plugin-map').once('value', function(snapshot) {
    var plugins = snapshot.val();
    var keys = Object.keys(plugins);

    for(var i=0; i<keys.length; i++) {
      if(plugins[keys[i]] == getSite()) {
        currentPlugin = keys[i];
        commandListener();
      }
    }
  });
};

var submitApp = function() {
  var submissionAppName = $('.ctrl-popup .ctrl-input').val();
  fb.child('plugins').child(submissionAppName).update(appDraft);

  var pluginMap = {};
  pluginMap[submissionAppName] = appDraft.map.site;
  fb.child('plugin-map').update(pluginMap);

  getCurrentPlugin(); // this will launch commandListener
};

var loadContentScript = function() {
  Firebase.INTERNAL.forceWebSockets();
  fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + uniqueId);

  getCurrentPlugin();
};

var getAndSetPebbleText = function() {
  var headerCssPath;
  var mainCssPath;

  var headerText;
  var mainText;

  var textRef = fb.child('plugins').child(currentPlugin).child('text');

  // get the cssPaths
  textRef.once('value', function(snapshot) {
    headerCssPath = snapshot.child('header').child('cssPath').val();
    mainCssPath   = snapshot.child('main').child('cssPath').val();

    html = "window.history.pushState = function(a,b,c) { console.log('pushed'); };";

    var headID = document.getElementsByTagName("head")[0];         
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.innerHTML = html;
    headID.appendChild(newScript);

    headerText = trim($(headerCssPath).text());
    mainText = trim($(mainCssPath).text());

    console.log('Header ' + headerText + ' main ' + mainText);

    // get inital text
    textRef.child('header').child('content').set(headerText);
    textRef.child('main').child('content').set(mainText);

    // update header text in firebase
    $(headerCssPath).unbind('DOMNodeInserted');
    $(headerCssPath).bind('DOMNodeInserted', function() {
      headerText = trim($(this).text());
      textRef.child('header').child('content').set(headerText);
    });

    // update main text in firebase
    $(mainCssPath).unbind('DOMNodeInserted');
    $(mainCssPath).bind('DOMNodeInserted', function() {
      mainText = trim($(this).text());
      textRef.child('main').child('content').set(mainText);
    });
  });

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

(function wait() {
  if(currentPlugin != null){
    getAndSetPebbleText();
  } else {
    setTimeout(wait, 500);
  }
})();

