var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log("HOME PAGE REQUESTED");

  res.render('index', { title: 'Wrist Control'});
});

/* GET some url */
router.get('/newthingy/*', function(req, res, next) {
    var requestedURL = req.params[0];

    //console.log("Here's the requested extension: " + requestedURL);
    res.render('frame', { title: 'Wrist Control',urlToFrame: requestedURL });
});

/* GET marketplace */
router.get('/marketplace/', function(req, res, next) {
	res.render('marketplace', { title: 'The Marketplace' });
});

module.exports = router;
