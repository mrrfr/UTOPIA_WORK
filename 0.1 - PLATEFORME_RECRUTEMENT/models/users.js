const db = require("./database/db")
const Callback = require('../models/utils/callback');

const crypto = require('../models/utils/crypto');


module.exports.inscription = async (prenom, nom_de_famille, email, numero_telephone, password)  => {
    if(
        prenom === undefined || prenom === null || nom_de_famille === undefined || nom_de_famille === null
        || email === undefined || email === null || password === undefined || password === null
        || numero_telephone === undefined || numero_telephone === null
    ) {
        return new Callback(406, "DATA_UNDEFINED");
    }

    let tips = "";
    let strength = 0;

    // Check longeur du mot de passe
    if (password.length < 12) {
        tips += "Augmentez la longueur du mot de passe. \n";
    } else {
        strength += 1;
    }

    // Check utilisation de majuscule et minuscule
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
        strength += 1;
    } else {
        tips += "Utilisez des majuscules et des minuscules. \n";
    }

    // Check de l'utilisatin de chiffre
    if (password.match(/\d/)) {
        strength += 1;
    } else {
        tips += "Ajoutez au moins un chiffre.\n";
    }

    // Check de l'utilisation de caractère spéciaux
    if (password.match(/[^a-zA-Z\d]/)) {
        strength += 1;
    } else {
        tips += "Ajoutez au moins un caractère spécial. ";
    }

    if (strength < 4) {
        return new Callback(400, "PASSWORD_NOT_SECURE", tips);
    }

    try {
        let todayDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let users_sql_insert = "INSERT INTO utilisateurs(nom, prenom, tel, adresse_email, date_creation, mot_de_passe, compte_status, user_group_uid) VALUES (?, ?, ?, ?, ?, ?, 'ACTIF', 1)"
        let encrypted_passwd = crypto.create_hash(password);

        let sql_values = [nom_de_famille.toString(), prenom.toString(), numero_telephone.toString(), email.toString(), todayDate.toString(), encrypted_passwd]

        let sql_result = await db.insert_into_sql(users_sql_insert, sql_values);

        console.log(sql_result);

        return new Callback(200, "PASS");
    } catch (err) {
        console.log("-------- ERROR INSCRIPTION ---------");
        console.log(err);
        return new Callback(500, "USING_ALREADY_REGISTRED_MAIL");
    }
}

module.exports.get_complete_user_profile = async (user_uid)  => {
    if(user_uid === undefined || user_uid === null) {
        return new Callback(406, "DATA_UNDEFINED");
    }

    try {
        let select_users = 'SELECT *\n' +
            'FROM utilisateurs\n' +
            'INNER JOIN `groups` g on utilisateurs.user_group_uid = g.group_uid\n' +
            'WHERE user_uid = ?';

        let sql_values = [user_uid.toString()];
        let sql_result = await db.get_item_from_db(select_users, sql_values);

        if (sql_result !== undefined && sql_result !== null) {
            delete sql_result.mot_de_passe;
            delete sql_result.date_creation;
            return sql_result;
        }
        throw new Error("USER_NOT_FOUND");
    } catch (err) {
        console.log("-------- ERROR GET USER ---------");
        console.log(err);
        throw new Error("UNKNOWN_ERROR_500");
    }
}



