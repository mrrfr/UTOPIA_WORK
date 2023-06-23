var express = require('express');
var router = express.Router();

router.get('/500', function(req, res, next) {
    res.render('errors/error-500');
});

router.get('/404', function(req, res, next) {
    res.render('errors/error-404');
});

module.exports = router;
