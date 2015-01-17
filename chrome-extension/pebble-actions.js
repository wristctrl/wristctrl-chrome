/*
This file loads any interactions provided by the user and manages their local controls when they've chosen them
*/

var thisUserID;

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
            alert("User id?: " + JSON.stringify(result));
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


console.log("Extension loaded.");

//tells whether or not the extension is activated (the controls drop down)
var dropDownShown = false;

//wraps the document in a div for more control
var documentWrapped = false;

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

//this loads the extension view (add on chrome click thing later lol)
var loadHTML = function () {
    if(!documentWrapped) {
        documentWrapped = true;
        wrapDocument();
    }

    //if it isn't shown already display the drop down controls
    if(dropDownShown == false) {
        dropDownShown = true;

        var newHTML = '';
        newHTML +=  '<div id="topbar" class="noHighlight">';
        newHTML +=      '<h1 id="wristTitle">WRIST<span class="t-red">•</span>CONTROL</h1>';
        newHTML +=      '<p id="another">Key input: </p>';
        newHTML +=      '<input id="upKey" placeholder="Key"/>';
        newHTML +=  '</div>';

        $('#theExtensionWrapper').addClass('moveDown');
        $('*').filter(function() {
            return $(this).css('position') == 'fixed';
        }).addClass('slideDown');

        $('body').prepend(newHTML);

        $('#upKey').keypress(function(event) {
            $('#upKey').val(getKeyName(event));
        });
    }
    else {
        dropDownShown = false;

        var element = document.getElementById("topbar");
        element.parentNode.removeChild(element);

        $('#theExtensionWrapper').removeClass('moveDown');
        $('*').filter(function() {
            return $(this).css('position') == 'fixed';
        }).removeClass('slideDown');
    }
}

$(document).on('click', function(e){
  if ($(e.target).hasClass("outlineElement")){
    e.preventDefault();
    console.log(e);
    var newHTML = '';
    newHTML += '<div class="popup">';
    newHTML += '<p>' + $(e.target).getPath() + '</p>';
    newHTML += '<input placeholder="Which pebble button"/>';
    newHTML += '</div>';
    var el = $(newHTML);
    el.css('top', e.pageY - el.height());
    el.css('left', e.pageX);
    $('body').append(el);
  }
});

//hover over elements when the extension is live (for the clicks)
$(document).mouseover(function(event) {
    //target.parents('div#hello').length
    if(dropDownShown && $(event.target).hasClass("noHighlight") == false && $(event.target).parents('#topbar').length == 0) {
        $(event.target).addClass('outlineElement');
    }
})
.mouseout(function(event) {
    $(event.target).removeClass('outlineElement');
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
