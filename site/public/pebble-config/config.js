
$(function() {
  var item = window.localStorage.getItem('config');
  var uniqueId;
  var config;

  if ( item === null || item.length === 0 ){
    config = {};
  } else {
    config = JSON.parse(item);
    if ( config.hasOwnProperty("unique-id") ){
      uniqueId = config['unique-id'];
      $('#unique-id').val(uniqueId);
    }
  }
  $('#submit').click(function(){
    if (typeof(config) === 'string' ){
      config = {};
    }
    uniqueId = $('#unique-id').val();
    config['unique-id'] = uniqueId;

    var jsconfig = JSON.stringify(config);
    window.localStorage.setItem('config', jsconfig);
    location.href = "pebblejs://close#" + encodeURIComponent( jsconfig );
    console.log(jsconfig);
  });

});
