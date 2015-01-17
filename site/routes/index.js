var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/*', function(req, res, next) {
  var requestedURL = req.params[0];

  //console.log("Here's the requested extension: " + requestedURL);
  res.render('index', { title: 'Wrist Control',urlToFrame: requestedURL });
});

module.exports = router;
