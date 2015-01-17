Pebble.addEventListener('ready', function(){
  getAndSetUniqueId(fireGet);
});

Pebble.addEventListener("showConfiguration", function (e) {
  var url = "http://463dd89a.ngrok.com";
  Pebble.openURL(url);
});

var fireGet = function(uniqueId){
  //connect to firebase and get rooms
  console.log(uniqueId);
};

var getAndSetUniqueId = function(callback){
  var config_str = window.localStorage.getItem('config');
  var config;
  if (typeof(config_str) !== 'undefined'){
    config = JSON.parse(config_str);
    console.log(config);
    var uniqueId = config["unique-id"];
    console.log(uniqueId);
    if (uniqueId.length > 5){
      callback(uniqueId);
      return;
    }
  }
  Pebble.showSimpleNotificationOnPebble("Woah there!",
      "You need to set your User ID in the Pebble app");
}

Pebble.addEventListener('webviewclosed', function(e) {
  if (!e.response){
    return;
  }
  var json = decodeURIComponent( e.response );
  config = JSON.parse( json );

  console.log("unique id is " + config["unique-id"] );

  window.localStorage.setItem( 'config', JSON.stringify( config ) );
  getAndSetUniqueId(fireGet);
});
