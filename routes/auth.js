const express = require('express');
const passport = require("passport");
const router = express.Router();

const auth_middleware = require('./middleware/auth-middleware');
const Callback = require("../models/utils/callback");
const usersModel = require("../models/users");

/* GET users listing. */
router.get('/connexion', function(req, res, next) {
    return res.render('auth/sign-in');
});

router.get('/inscription', function(req, res, next) {
    return res.render('auth/register');
});

router.post('/connexion', passport.authenticate('local'), function(req, res, next) {
    if(req.user) {
        req.logIn(req.user, { session: true }, function(error) {
            if (error) return next(error);
            return res.send({user_message: 'Connexion réussie'});
        });
    } else {
        res.statusCode = 500;
        res.send({user_message: 'Identifiants incorrects'})
    }
});

router.post('/register', async function (req, res, next) {
    let nom = req.body.nom_de_famille;
    let prenom = req.body.prenom;
    let numero_telephone = req.body.numero_telephone;
    let email = req.body.email;
    let password = req.body.mot_de_passe;
    let cpassword = req.body.c_mot_de_passe;

    if (nom === undefined || prenom === undefined || email === undefined || password === undefined || cpassword === undefined) {
        console.log(`NOM : ${nom} -- PRENOM : ${prenom} -- MAIL : ${email} -- PASSWORD : ${password} -- CPASSWORD : ${cpassword}`)
        let callback = new Callback(406, "DATA_UNDEFINED")
        res.status(406).send(callback.callbackToJson());
        return;
    }

    if (password !== cpassword) {
        console.log(`PASSWORD : ${password} -- CPASSWORD : ${cpassword}`)
        let callback = new Callback(406, "PASSWORD_NOT_SAME_AS_CPASSWORD")
        res.status(406).send(callback.callbackToJson());
        return;
    }

    const fr_phone_test_regex = new RegExp(/^((\+)33|0|0033)[1-9](\d{2}){4}$/g);

    if (!fr_phone_test_regex.test(numero_telephone)) {
        let callback = new Callback(406, "PHONE_INCORRECT")
        res.status(406).send(callback.callbackToJson());
        return;
    }

    let callback = await usersModel.inscription(prenom, nom, email, numero_telephone, password);
    res.status(callback._code).send(callback.callbackToJson());

});

router.post('/logout', auth_middleware.is_user_logged_in, function(req, res, next) {
    req.logout({ session: true }, function(error) {
        if (error) return next(error);
        return res.status(200).send({user_message: 'Déconnexion réussie'});
    });
});

module.exports = router;
