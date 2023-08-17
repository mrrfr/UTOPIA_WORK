const express = require('express');
const router = express.Router();

const auth_middleware = require('./middleware/auth-middleware');
const db = require("../models/database/db");

const admin_model = require("../models/admin");
const organisations_model = require("../models/organisation");

/* GET home page. */
router.get('/users',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = await admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        res.render('admin/users', {title: "UT'OPIA - L'avenir", user: req.user});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.get('/organisations',  auth_middleware.is_user_logged_in, function(req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        res.render('admin/organisations', { title: "UT'OPIA - L'avenir", user: req.user });
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }

});

router.post('/organisations',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await organisations_model.get_organisations(req)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.post('/organisations/:siren',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await admin_model.update_org_status(req.params.siren, "ACCEPTÉE")
        res.status(200).send({result: output});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.delete('/organisations/:siren',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await admin_model.update_org_status(req.params.siren, "REFUSÉE")
        res.status(200).send({result: output});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.delete('/organisations/:siren/suppression',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await admin_model.delete_organisation(req.params.siren)
        res.status(200).send({result: output});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.post('/users',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }

        let output = await admin_model.get_users(req)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.delete('/users/:id',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await admin_model.delete_user(req.params.id)
        res.status(200).send({result: output});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.post('/users/:id',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let is_user_admin = admin_model.is_user_admin(req.user.user_uid);
        if (!is_user_admin) {
            res.status(500).render('errors/error-500');
            return
        }
        let output = await admin_model.update_user(req.params.id, req.body)
        res.status(200).send({result: output});
    } catch (e) {
        console.log(e)
        res.status(500).render('errors/error-500');
    }
});

router.get('/index2',  auth_middleware.is_user_logged_in, function(req, res, next) {
    res.render('pages/template-2', { title: 'Express' });
});


module.exports = router;
