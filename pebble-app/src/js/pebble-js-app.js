Pebble.addEventListener("ready", function() {
  console.log("PebbleKit JS is Ready!");
  Pebble.sendAppMessage({
    'app_1': 'scott',
    'app_2': 'ben',
    'app_3': 'rhys',
    'app_4': 'john',
    'app_5': 'kirby'
  });
  getAndSetUniqueId(fireGet);
});

Pebble.addEventListener("appmessage", function(msg) {
  console.log("Got a message!");
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
