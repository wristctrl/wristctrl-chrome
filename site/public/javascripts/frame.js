var app = angular.module("app", ["firebase"]);

app.controller("MarketplaceCtrl", function($scope, $firebase) {
  var ref = new Firebase("https://8tracks-pebble.firebaseio.com/marketplace");
  var sync = $firebase(ref);
  // create a synchronized array for use in our HTML code
  $scope.apps = sync.$asArray();
  // $scope.hello = 'hi';
});

