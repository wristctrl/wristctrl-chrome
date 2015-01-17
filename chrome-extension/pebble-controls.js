/*
This controls the actions on the clicked extension (the part of the page that the extension adds like when they are customizing)
*/

//this calls the loadHTML method in pebble actions.js
/*chrome.tabs.executeScript(null,{
    code: "loadHTML()"
    //code:"document.body.style.backgroundColor='red'"
});*/
chrome.browserAction.onClicked.addListener(function() {
    //console.log("Some click");
    chrome.tabs.executeScript(null,{
        code: "loadHTML()"
        //code:"document.body.style.backgroundColor='red'"
    });
});
console.log("You can't see this.");
