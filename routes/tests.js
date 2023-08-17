const express = require('express');
const router = express.Router();


/* GET users listing. */
router.get('/mysql', async function (req, res, next) {
    let callback = await tests.test_sql();
    res.status(callback._code).send(callback.callbackToJson());
});

router.get('/get_from_db', async function (req, res, next) {
    let callback = await tests.get_from_db();
    res.status(callback._code).send(callback.callbackToJson());
});

router.get('/404', function(req, res, next) {
    res.render('error-404');
});

module.exports = router;
