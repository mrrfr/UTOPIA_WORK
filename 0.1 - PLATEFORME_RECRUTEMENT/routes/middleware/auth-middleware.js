module.exports = {
    is_user_logged_in: function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
            return;
        }
        return res.redirect('/authentification/connexion');
    },
}
