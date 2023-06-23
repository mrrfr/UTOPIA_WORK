<h1>SR10-P23 / Projet - Plateforme de Recrutement / UT'OPIA - WORK </h1>
<div style="text-align: center;"> 
    <p align="center">Le Projet Plateforme de Recrutemen est un projet développé dans le cadre de l'UV SR10 à l'UTC en P23. Ce projet a été supervisé par : <br> AKHERAZ Mohamed</p>
    <p style="font-size: 0.8rem; margin-top: 4vh"> Par <a href="https://github.com/RayanDoudech" target="_blank" style="color: darkred">DOUDECH Taïeb Rayen</a> dans le cadre de l'UV SR10 en P23</p>
</div>

# Rapport sur la sécurité :

J'ai traité la sécurité de notre application en deux parties : la sécurité de l'application et la sécurité des utilisateurs.

Il est impensable de penser qu'en 2023 une application web ne soit pas vulnérable. Toute base de données a des chances ne serait-ce qu'infime de se faire attaquer. C'est pourquoi j'ai mis en place des mesures de sécurité pour protéger les données de nos utilisateurs.

Il est important de noter nous sommes dans un cadre pédagoqiue, Je me suis alors seulement concentrées sur 3 vulnérabilités, je n'ai pas traité les failles XSS, CSRF, etc...

Les vulnérabilités qui m'ont semblé importante et que j'ai traité sont les suivantes :
<ul>
<li>Cryptographie des données sensibles</li>
<li>Injection SQL</li>
<li>Violation de contrôle d'accès</li>
</ul>

## 1. Sécurité des données utilisateurs - Cryptographie des données sensibles : 
Notre application ne traite pas des données à caractére sensibles hormis les mots de passe, c'est pourquoi j'ai crypté les mots de passe via la libraire crypto en utilisant un algorithme de cryptage réputé inviolable pour l'instant : l'algorithme AES-256-GCM. Nous avons également ajouté un sel pour renforcer la sécurité.

### Exemples de codes :
```javascript
module.exports.create_hash = (string_to_hash) => {
    let key = crypto.createHash('sha256').update(String(apiKeys.keys.crypto.key)).digest('base64').substr(0, 32);
    let cipher = crypto.createCipheriv(apiKeys.keys.crypto.algorithm, key, apiKeys.keys.crypto.iv);
    return  cipher.update(string_to_hash, 'utf8', 'hex') + cipher.final('hex');
}
```

### Pistes d'amélioration :
Ce projet n'est pas destiné à être commercialisé et/ou publié donc j'ai décidé de ne pas pousser la cryptographie jusqu'au bout. 
Supposons qu'un pirate penetre la base de données, on peut donc imaginer qu'il est très probable qu'il puisse remonter à notre code source, il pourra donc retrouver le vecteur ainsi que la cléf qui ont permis de crypter le mot de passe ainsi il pourra aiséement décrypter les mots de passe.
Une piste d'amélioration sur ce point serait, comme ce qui se fait dans l'industrie, de trouver une fonction de mathématique qui génère une clef et un vecteur pour chaque mot de passe, ainsi chaque hash serait unique et même nous, les développeurs du site nous n'arrivrons pas à remonter aux mots de passe.

## 2. Sécurité de l'application - Injection SQL :

Il est important de considérer les failles de types injection SQL c'est pourquoi tous les inputs de l'utilisateur sont controlées et inséré en tant que valeur et non dans une chaine conactané. Ainsi nous sommes sûrs de la fiabilité des chaînes transmises et executés dans notre base de données.

### Exemples de codes :
```javascript
        let todayDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let users_sql_insert = "INSERT INTO utilisateurs(nom, prenom, tel, adresse_email, date_creation, mot_de_passe, compte_status, user_group_uid) VALUES (?, ?, ?, ?, ?, ?, 'ACTIF', 1)"
        let encrypted_passwd = crypto.create_hash(password);
        let sql_values = [nom_de_famille.toString(), prenom.toString(), numero_telephone.toString(), email.toString(), todayDate.toString(), encrypted_passwd]
        let sql_result = await db.insert_into_sql(users_sql_insert, sql_values);
```


## 3. Sécurité de l'application - Violation de contrôle d’accès :

Nous avons protégé les routes pour que les utilisateurs ne puissent pas accéder à des pages qui ne leur sont pas destinées. Par exemple, un utilisateur non connecté ne peut pas accéder à la page des offres / Un utilisateur connecté ne peut pas accéder à la page de connexion. / Un utilisateur (non-recruteur) connecté ne peut pas accéder à la page de création d'offre / Un utilisateur (non-administrateur, donc peut-être recruteur ou candidat) connecté ne peut pas accéder à la page de gestion des organisations /  Un utilisateur (non-administrateur, donc peut-être recruteur ou candidat) connecté ne peut pas accéder à la page de gestion des utilisateurs / etc...
à la place, les utilisateurs sont redirigés vers la page error 404 ou 500 en fonction du cas.

#### Contrôle d'accès des routes connectés :
J'ai implementé un middleware qui vérifie si l'utilisateur est connecté ou non, si il ne l'est pas, il est redirigé vers la page de connexion.
Voici le code du middleware, req.isAuthenticated() est une fonction de passport qui vérifie si l'utilisateur est connecté ou non
```javascript
module.exports = {
    is_user_logged_in: function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
            return;
        }
        return res.redirect('/authentification/connexion');
    },
}
```

#### Contrôle d'accès des routes recruteurs :
Voici un exemple de routes pour un POST pour la création d'une offre dans une organisation  (déstiné aux recruteurs d'une orgnaisation) :
```javascript
router.post('/offers/creation', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;
        let publish_result = await organisationsModel.create_offre(req.user.user_uid, siren, req.body);
        res.status(200).send(publish_result);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});
```

#### Contrôle d'accès des routes administrateurs :
Voici un exemple de routes pour la page de gestion des utilisateurs (déstiné à l'administrateur) :
```javascript
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
```

### Pistes d'amélioration :
Créer des middelware partout au lieu de faire les vérifications dans les routes, cela permettrait de factoriser le code et de le rendre plus lisible.
