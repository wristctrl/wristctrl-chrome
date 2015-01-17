Pebble.addEventListener("ready", function() {
  console.log("PebbleKit JS is Ready!");
  Pebble.sendAppMessage({
    'app_1': 'scott',
    'app_2': 'ben',
    'app_3': 'rhys',
    'app_4': 'john',
    'app_5': 'kirby'
  });
});

Pebble.addEventListener("appmessage", function(msg) {
  console.log("Got a message!");
});
