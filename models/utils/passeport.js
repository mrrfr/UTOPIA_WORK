const LocalStrategy = require('passport-local').Strategy
const db = require("../database/db");
const crypto = require("./crypto");

function initialize(passport) {
    passport.use('local', new LocalStrategy({ usernameField: 'email', passwordField: 'mot_de_passe', passReqToCallback: true }, async function (req, username, password, cb) {
        // Search user by email in DB
        let email = req.body.email;
        if (
            email === undefined || password === undefined
        ) {
            cb(null, false, {message: "DATA_UNDEFINED"})
        }

        try {
            let select_users = 'SELECT user_uid, nom, prenom, adresse_email, compte_status, user_group_uid\n' +
                'FROM utilisateurs\n' +
                'WHERE adresse_email = ?\n' +
                'AND mot_de_passe = ?';

            let encrypted_passwd = crypto.create_hash(password);

            let sql_values = [email.toString(), encrypted_passwd]
            let sql_result = await db.get_item_from_db(select_users, sql_values);

            if (sql_result !== undefined && sql_result !== null) {
                cb(null, sql_result);
            } else {
                cb(null, false)
            }
        } catch (err) {
            cb(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.user_uid)
    })
    passport.deserializeUser(async (id, done) => {
        if (id === undefined || id === null) {
            return done("DATA_UNDEFINED");
        }

        try {
            let select_users = 'SELECT user_uid, nom, prenom, adresse_email, compte_status, g.group_name, g.group_uid\n' +
                'FROM utilisateurs\n' +
                'INNER JOIN `groups` g on utilisateurs.user_group_uid = g.group_uid\n' +
                'WHERE user_uid = ?';

            let sql_values = [id.toString()];

            let sql_result = await db.get_item_from_db(select_users, sql_values);

            if (sql_result !== undefined && sql_result !== null) {
                return done(null, sql_result);
            }

            return done(null, false)
        } catch (err) {
            done(err)
        }
    })
}

module.exports = initialize
