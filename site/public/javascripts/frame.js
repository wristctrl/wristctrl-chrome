var app = angular.module("app", ["firebase"]);

app.controller("MarketplaceCtrl", function($scope, $firebase) {
  var ref = new Firebase("https://8tracks-pebble.firebaseio.com/marketplace");
  var sync = $firebase(ref);
  $scope.apps = sync.$asArray();

  $scope.addApp = cats;
});

var cats = function(app) {
  var currApp = app.$id;

  var uniqueId = localStorage.getItem("ctrl-uniqueId");

  var fb = new Firebase('https://8tracks-pebble.firebaseio.com/');

  fb.child('marketplace').child(currApp).once('value', function(snapshot) {
    var appCopy = snapshot.val();
    fb.child('codes').child(uniqueId).child(currApp).update(appCopy);
    fb.child('codes').child(uniqueId).child(currApp).child('img').remove();
  });

};

