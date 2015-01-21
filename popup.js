console.log('popup.js');

Firebase.INTERNAL.forceWebSockets();

var uniqueId = null;
var fb;

var genId = function() {
  var idLength = 6;
  var text = "";
  var charset = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

  for( var i=0; i < idLength; i++ ) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return text;
}

var generateAndStoreUniqueId = function() {
  uniqueId = genId();

  localStorage.setItem("ctrl-uniqueId", uniqueId);
};

$(function() {
  $("#ctrl-uniqueId").text(uniqueId);

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

  $('#ctrl-marketplace').on('click', function() {
    window.close();
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
      chrome.tabs.sendMessage(tabs[0].id, {action: "redirectToMarketplace"});
    });
  });
});

uniqueId = localStorage.getItem("ctrl-uniqueId");

if(uniqueId == null) {
  generateAndStoreUniqueId();
}

chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
  chrome.tabs.sendMessage(tabs[0].id, {'uniqueId': uniqueId});
});

fb = new Firebase('https://8tracks-pebble.firebaseio.com/codes/' + uniqueId);

var app = angular.module("popup", ["firebase"]);

app.controller("appCtrl", function($scope, $firebase) {
  var sync = $firebase(fb);
  $scope.plugins = sync.$asArray();
});

