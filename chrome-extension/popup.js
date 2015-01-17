console.log('popup.js');

$(function() {
  console.log('ready');

  $('button').on('click', function() {
    console.log('clicked');

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
      chrome.tabs.sendMessage(tabs[0].id, {action: "readDom"});
    });
  });

});
