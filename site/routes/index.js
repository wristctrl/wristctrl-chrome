var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log("HOME PAGE REQUESTED");

  res.render('index', { title: 'Wrist Control'});
});

module.exports = router;
