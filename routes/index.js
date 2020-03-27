const express = require('express');
const router = express.Router();
var dashboardController = require('../controllers/dashboardController');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});
router.get('/index', function(req, res) {
  res.render('index');
});
router.get('/favicon.ico', function (req,res) {
  res.send('')
});

router.param('graphname', function (req, res, next, graphname) {
  req.url= '/graphs/'+graphname;
  dashboardController.axiosConnection(req, res, next);
  next();
});
router.get('/viewer?filename=:graphname', function (req, res, next) {
  dashboardController.axiosConnection(req, res, next);
} );

router.all('*',function (req, res, next) { dashboardController.axiosConnection(req, res, next); });

module.exports = router;
