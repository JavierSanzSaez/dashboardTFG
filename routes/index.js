const express = require('express');
const router = express.Router();
const axios = require('axios');
const asyncHandler = require('express-async-handler');
var dashboardController = require('../controllers/dashboardController');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/favicon.ico', function (req,res,next) {
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
