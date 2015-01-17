/*
This file loads any interactions provided by the user and manages their local controls when they've chosen them
*/
console.log("Extension loaded.");

var thisUserID;

//tells whether or not the extension is activated (the controls drop down)
var dropDownShown   = false;
var pickMode        = false;
var appDraft        = {
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

var savePageSettings = function() {
    //do the firebase call here to save data to the page
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

var wrapDocument = function() {
    var div = document.createElement("div");
    div.id = "theExtensionWrapper";

    // Move the body's children into this wrapper
    while (document.body.firstChild)
    {
        div.appendChild(document.body.firstChild);
    }

    // Append the wrapper to the body
    document.body.appendChild(div);
}

var checkAppState = function(){
  console.log(appDraft.buttons.up.cssPath);
  console.log(appDraft.buttons.up.action);
  if (appDraft.buttons.up.cssPath !== null && appDraft.buttons.up.action !== null){
    $("#topbar .app-status .up").html("SET");
  }
  if (appDraft.buttons.down.cssPath !== null && appDraft.buttons.down.action !== null){
    $("#topbar .app-status .down").html("SET");
  }
  if (appDraft.buttons.select.cssPath !== null && appDraft.buttons.select.action !== null){
    $("#topbar .app-status .select").html("SET");
  }
}

//this loads the extension view (add on chrome click thing later lol)
var loadHTML = function () {
    //if it isn't shown already display the drop down controls
    if(dropDownShown == false) {
        dropDownShown = true;

        var newHTML = '';
        newHTML +=  '<div id="topbar" class="noHighlight">';
        newHTML +=      '<div class="title">';
        newHTML +=          '<h1 id="wristTitle">WRIST<span class="t-red">•</span>&lt;CTRL&gt;</h1>';
        newHTML +=      '</div>';
        newHTML +=      '<div class="input">';
        newHTML +=          '<p id="another">Key input: </p>';
        newHTML +=          '<input id="upKey" placeholder="Key"/>';
        newHTML +=      '</div>';
        newHTML +=      '<div>';
        newHTML +=          '<p>When you would like to choose an element to select, start here!</p>';
        newHTML +=          '<p>Picker is currently: <span class="status">NOT ACTIVE</span></p>';
        newHTML +=          '<button class="start-picker">Start</button>';
        newHTML +=      '</div>';
        newHTML +=      '<div class="app-status">';
        newHTML +=          '<p>State of current app being built</p>';
        newHTML +=          '<p>Name: <span class="site">' + appDraft.site + '</span></p>';
        newHTML +=          '<p>Up: <span class="up">not set</span></p>';
        newHTML +=          '<p>Down: <span class="down">not set</span></p>';
        newHTML +=          '<p>Select: <span class="select">not set</span></p>';
        newHTML +=      '</div>';
        newHTML +=  '</div>';

        $('body').addClass('moveDown');
        var fixedElements = $('*').filter(function() {
            return $(this).css('position') == 'fixed';
        });
        fixedElements.each(function(index, el) {
            $(el).css('top', '48px');
            console.log(el);
        });

        $('body').prepend(newHTML);

        $('#upKey').keypress(function(event) {
            $('#upKey').val(getKeyName(event));
        });
    }
    else {
        dropDownShown = false;
        pickMode = false;

        var element = document.getElementById("topbar");
        element.parentNode.removeChild(element);

        $('body').removeClass('moveDown');
        var fixedElements = $('*').filter(function() {
            return $(this).css('position') == 'fixed';
        });
        fixedElements.each(function(index, el) {
            $(el).css('top', '0px');
            console.log(el);
        });
    }
}

$(document).on('click', '.popup span.close', function(e){
  var par = $(e.target).parent();
  console.log(par.data('path'));
  par.remove();
  $('.popup-bg').remove();
  $('.inside-after').remove();
});

$(document).on('click', '.popup button.submit', function(e){
  var par = $(e.target).parent();
  console.log(par.data('path'));
  var button = $('body > div.popup > select').val();
  console.log(button);
  appDraft.buttons[button].cssPath = par.data('path');
  appDraft.buttons[button].action  = 'click';
  checkAppState();
  $('.popup-bg').remove();
  $('.inside-after').remove();
  par.remove();
  pickMode = false;
});

$(document).on('click', 'button.start-picker', function(e){
  pickMode = true;
  var par = $(e.target).parent();
  $('.status', par).html("Active!");
});

//hover over elements when the extension is live (for the clicks)
$(document).on('mouseover', function(event) {
    if(!pickMode){
      return;
    }
    var parentPointer = function(el) {
        if ($(el).parent().css('cursor') == 'pointer') {
            return parentPointer($(el).parent());
        }
        else {
            return el;
        }
    }

    //target.parents('div#hello').length
    if(!$(event.target).hasClass("inside-after") && $(event.target).parents('#topbar').length == 0) {
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
    } else if ($(event.target).hasClass("inside-after")) {
        $('.inside-after').click(function(event) {
            event.preventDefault();
            var newHTML = '';
            var upDis = '';
            var selectDis = '';
            var downDis = '';
            if (!appDraft.buttons.up){
              upDis = 'disabled';
            }
            if (!appDraft.buttons.select){
              selectDis = 'disabled';
            }
            if (!appDraft.buttons.down){
              downDis = 'disabled';
            }
            newHTML += '<div class="popup-bg"></div>'
            newHTML += '<div class="popup" data-path="' + $(event.target).getPath() + '">';
            newHTML += '<span class="close">✖</span>';
            newHTML += '<p>' + $(event.target).getPath() + '</p>';
            newHTML += '<select name="button-chooser">';
            newHTML +=    '<option value="up" ' + upDis + '>Up</option> ';
            newHTML +=    '<option value="select"' + selectDis + '>Select</option>';
            newHTML +=    '<option value="down"' + downDis + '>Down</option>';
            newHTML += '</select>';
            newHTML += '<button class="submit">GO</button>';
            newHTML += '</div>';
            var el = $(newHTML);
            $('body').append(el);
            pickMode = false;
        });
    }
})
.on('mouseout', function(event) {
    if(!pickMode){
      return;
    }
    // $('.inside-after', $(event.target)).remove();
    // $(event.target).removeClass('outlineElement');
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
};//$('#').click();

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
