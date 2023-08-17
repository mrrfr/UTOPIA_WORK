const express = require('express');
const router = express.Router();

const Callback = require('../models/utils/callback');
const usersModel = require('../models/users');
const organisationsModel = require('../models/organisation');
const auth_middleware = require("./middleware/auth-middleware");
const organisations_model = require("../models/organisation");
const offre_model = require("../models/offre");
const candidature_model = require("../models/candidature");

const fileUpload = require("express-fileupload");

const path = require("path");

router.get('/',  auth_middleware.is_user_logged_in, function(req, res, next) {
    res.render('public/public-offers', { title: "UT'OPIA - L'avenir", user: req.user });
});

router.post('/offers', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let output = await offre_model.get_offers(req)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});


router.get('/offers/creation', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }

        res.render("organisation/offers-creation", {title: "UT'OPIA - L'avenir", user: req.user, creation: true});

    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

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

router.get('/mes-candidatures',  auth_middleware.is_user_logged_in, function(req, res, next) {
    res.render('public/user-candidatures', { title: "UT'OPIA - L'avenir", user: req.user });
});

router.post('/mes-candidatures', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let output = await candidature_model.get_user_candidatures(req, req.user.user_uid)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.get('/candidature/:offre', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

        if (!is_user_allowed_to_candidate) {
            res.status(500).redirect('/error/500');
            return
        }

        let offre = await offre_model.get_offre_by_id_without_siren(parseInt(req.params.offre, 10));

        if(offre === undefined){
            res.status(500).redirect('/error/404');
            return
        }

        let offre_uid = offre.offre_uid;
        let candidature = await candidature_model.create_candidature(offre_uid, req.user.user_uid);

        let user_model = await usersModel.get_complete_user_profile(req.user.user_uid);
        let docs = await candidature_model.get_files(candidature.candidature_uid);

        res.render("public/candidature", {title: "UT'OPIA - L'avenir", user: req.user, creation: true, offre: offre, user_model: user_model, candidature: candidature, files: docs});
    } catch (e) {
        if (e.message === "user_already_applied_to_this_offer") {
            let user_candidature_uid = await candidature_model.get_user_candidature(req.user.user_uid, req.params.offre);
            return res.redirect('/offres/candidature/' + req.params.offre + '/' + user_candidature_uid.candidature_uid)
        }
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.get('/candidature/:offre/:candidature', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

        if (!is_user_allowed_to_candidate) {
            res.status(500).redirect('/error/500');
            return
        }

        let offre = await offre_model.get_offre_by_id_without_siren(parseInt(req.params.offre, 10));
        if(offre === undefined){
            res.status(500).redirect('/error/500');
            return
        }

        let candidature = await candidature_model.get_candidature(req.params.candidature);
        let user_model = await usersModel.get_complete_user_profile(req.user.user_uid);
        console.log(candidature)

        let docs = await candidature_model.get_files(candidature.candidature_uid);
        res.render("public/candidature", {title: "UT'OPIA - L'avenir", user: req.user, creation: true, offre: offre, user_model: user_model, candidature: candidature, files: docs});
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/candidature/:candidature/publier',
    auth_middleware.is_user_logged_in,
    fileUpload({ createParentPath: true }),
    async (req, res) => {
        try {
            let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

            if (!is_user_allowed_to_candidate) {
                res.status(500).redirect('/error/500');
                return
            }

            let candidature = req.params.candidature;

            if (candidature === undefined) {
                res.status(500).redirect('/error/500');
                return
            }


            let output = await candidature_model.update_candidature_status(candidature, 2);

            return res.status(200).send({status: 'success', message: "OK"})
        } catch (e) {
            console.log(e)
            res.status(500).redirect('/error/500');
        }
});

router.delete('/candidature/:candidature/supprimer',
    auth_middleware.is_user_logged_in,
    fileUpload({ createParentPath: true }),
    async (req, res) => {
        try {
            let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

            if (!is_user_allowed_to_candidate) {
                res.status(500).redirect('/error/500');
                return
            }

            let candidature = req.params.candidature;
            if (candidature === undefined) {
                res.status(500).redirect('/error/500');
                return
            }

            let output = await candidature_model.delete_candidature(candidature);

            return res.status(200).send({status: 'success', message: "OK"})
        } catch (e) {
            console.log(e)
            res.status(500).redirect('/error/500');
        }
    });

router.post('/candidature/:offre/:candidature/upload',
    auth_middleware.is_user_logged_in,
    fileUpload({ createParentPath: true }),
    async (req, res) => {
    try {
        let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

        if (!is_user_allowed_to_candidate) {
            res.status(500).redirect('/error/500');
            return
        }

        let offre = await offre_model.get_offre_by_id_without_siren(parseInt(req.params.offre, 10));
        if(offre === undefined){
            res.status(500).redirect('/error/500');
            return
        }



        let candidature = req.params.candidature;
        if (candidature === undefined ){
            res.status(500).redirect('/error/500');
            return
        }


        let docs = await candidature_model.get_files(candidature);
        if (docs.length + 1 > offre.nb_piece_demandes) {
            return res.status(400).json({ status: "error", message: "Vous ne pouvez pas upload plus que la demande maximale de fichier" })
        }

        if (!req.files) return res.status(400).json({ status: "error", message: "Missing files" })
        const files = req.files

        const fileExtensions = []
        Object.keys(files).forEach(key => {
            fileExtensions.push(path.extname(files[key].name))
        })

        let allowedExtArray = ['.pdf', '.docx', '.png']
        const allowed = fileExtensions.every(ext => allowedExtArray.includes(ext))

        if (!allowed) {
            const message = `L'upload a echoué. Vous avez envoyé un fichier non autorisé. Voici la liste des types autorisés : ${allowedExtArray.toString()}`.replaceAll(",", ", ");

            return res.status(422).json({ status: "error", message });
        }

        const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

        const filesOverLimit = []
        Object.keys(files).forEach(key => {
            if (files[key].size > FILE_SIZE_LIMIT) {
                filesOverLimit.push(files[key].name)
            }
        })

        if (filesOverLimit.length) {

            const sentence = `L'upload n'a pas réussi. ${filesOverLimit.toString()} vos fichiers sont supérieur à 5 MB.`.replaceAll(",", ", ");

            const message = filesOverLimit.length < 3
                ? sentence.replace(",", " and")
                : sentence.replace(/,(?=[^,]*$)/, " and");

            return res.status(413).json({ status: "error", message });

        }

        if (!files) {
            res.status(500).redirect('/error/500');
            return
        }

        let upload_result = await candidature_model.upload_file(files, candidature, req.user.user_uid)

        return res.status(200).send({ status: 'success', message: Object.keys(files).toString() })
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.delete('/candidature/:offre/:candidature/delete/:file',
    auth_middleware.is_user_logged_in,
    fileUpload({ createParentPath: true }),
    async (req, res) => {
        try {
            let is_user_allowed_to_candidate = await candidature_model.is_user_allowed_to_candidate(req.user.user_uid);

            if (!is_user_allowed_to_candidate) {
                res.status(500).redirect('/error/500');
                return
            }

            let offre = await offre_model.get_offre_by_id_without_siren(parseInt(req.params.offre, 10));
            if(offre === undefined){
                res.status(500).redirect('/error/500');
                return
            }

            let candidature = req.params.candidature;
            if (candidature === undefined ){
                res.status(500).redirect('/error/500');
                return
            }

            let file = req.params.file;
            let output = await candidature_model.delete_doc(file, (req.user.group_id === 3) ? undefined : req.user.user_uid);
            console.log(output)
            return res.status(200).send({ status: 'success', message: output })
        } catch (e) {
            console.log(e)
            res.status(500).redirect('/error/500');
        }
    });



router.get('/offers/edition/:offre_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;

        let offre = await offre_model.get_offre_by_id(siren, parseInt(req.params.offre_id, 10));
        res.render("organisation/offers-creation", {title: "UT'OPIA - L'avenir", user: req.user, creation: false, offre:offre});

    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/offers/edition/:offre_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;
        let offre = await offre_model.edit_offre(parseInt(req.params.offre_id, 10), siren, req.body);
        res.status(200).send(offre);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.delete('/offers/:offre_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;
        let offre = await offre_model.delete_offre_by_id(siren, parseInt(req.params.offre_id, 10));
        res.status(200).send(offre);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.get('/members', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        res.render("organisation/members", {title: "UT'OPIA - L'avenir", user: req.user});

    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/members', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation_siren = await organisationsModel.get_user_org(req.user.user_uid);
        let output = await organisations_model.get_user_organisation_members(req.user.user_uid, user_organisation_siren, req)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/members/:member_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation_siren = await organisationsModel.get_user_org(req.user.user_uid);
        let output = await organisationsModel.update_org_member_status(req.params.member_id, user_organisation_siren, "ACCEPTÉE");
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.delete('/members/:member_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation_siren = await organisationsModel.get_user_org(req.user.user_uid);
        let output = await organisationsModel.update_org_member_status(req.params.member_id, user_organisation_siren, "REFUSÉE");
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/creation', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let organisations_types = await organisationsModel.create_organisation(req.user.user_uid, req.body);
        res.status(200).send({result: organisations_types})
    } catch (e) {
        res.status(500).redirect('/error/500');
    }
});

router.post('/adhesion', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let adhesion_result = await organisationsModel.rejoindre_org(req.user.user_uid, req.body.siren);
        console.log(adhesion_result)
        res.status(200).send({result: adhesion_result})
    } catch (e) {
        res.status(500).redirect('/error/500');
    }
});

module.exports = router;
