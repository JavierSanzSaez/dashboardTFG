const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const sessionController = require('../controllers/session');

/* GET home page. */
router.get('/', function(req, res) {
    req.session.dockerDestino = "new";
    res.render('index',{sesion: true});
});
router.get('/index', function(req, res) {
    req.session.dockerDestino = "new";
    res.render('index', {sesion: true});
});
router.get('/favicon.ico', function (req,res) {
    res.send('')
});

router.param('graphname', function (req, res, next, graphname) {
  req.url= '/graphs/'+graphname;
  sessionController.checkSession
      .then(
      dashboardController.axiosConnection(req, res, next)
      );
  next();
});
router.get('/viewer?filename=:graphname', function (req, res, next) {
  sessionController.checkSession
      .then(
          dashboardController.axiosConnection(req, res, next)
      );
} );

router.all('*',sessionController.checkSession,function (req, res, next) { dashboardController.axiosConnection(req, res, next); });

module.exports = router;
