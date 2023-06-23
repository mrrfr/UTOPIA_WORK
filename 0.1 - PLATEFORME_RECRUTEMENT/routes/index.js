const express = require('express');
const router = express.Router();

const auth_middleware = require('./middleware/auth-middleware');

/* GET home page. */
router.get('/',  auth_middleware.is_user_logged_in, function(req, res, next) {
  res.render('index.ejs', { title: "UT'OPIA - L'avenir", user: req.user });
});

router.get('/index2',  auth_middleware.is_user_logged_in, function(req, res, next) {
  res.render('pages/template-2', { title: 'Express' });
});


module.exports = router;
