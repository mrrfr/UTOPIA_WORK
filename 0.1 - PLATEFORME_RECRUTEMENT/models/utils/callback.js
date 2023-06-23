class Callback {
    constructor(code, code_str, user_message=undefined) {
        this._code = code;
        this._success = parseInt((code + '').charAt(0)) === 2 || parseInt((code + '').charAt(0)) === 3;
        this._codeStr = code_str;

        if (user_message === undefined) {
            this._userMessage = this.usersMessage[code_str];
        } else {
            this._userMessage = user_message;
        }
    }

    callbackToJson() {
        return JSON.stringify(
            {
                success: this._success,
                code: this._code,
                message: this._codeStr,
                user_message: this._userMessage,
            }
        )
    }


    usersMessage = {
        PASSWORD_NOT_SAME_AS_CPASSWORD : "le champ de confirmation du mot de passe et le mot de passe sont différents",
        DATA_UNDEFINED : "les champs ne sont pas remplis correctement",
        PHONE_INCORRECT : "Le numéro de téléphone inséré n'est pas correct!",
        REGISTER_REQUEST_SUCCESSFUL : "Le compte a été créé avec succès, vous allez être redirigé vers la page de connexion!",
        USING_ALREADY_REGISTRED_MAIL : "Un compte existe déjà avec cette adresse mail!",
        ERROR_401 : "Aucun utilisateur enregistré ne correspond aux informations saisies!",
        ERROR_500 : "Le serveur a rencontré une erreur, veuillez re-tentez votre requête ultérieurement!",
        PASS : "Succès",
        SAMPLE : "DEFAULT",
    }
}

module.exports = Callback;
