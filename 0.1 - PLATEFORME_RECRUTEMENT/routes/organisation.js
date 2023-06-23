const express = require('express');
const router = express.Router();

const organisationsModel = require('../models/organisation');
const auth_middleware = require("./middleware/auth-middleware");
const organisations_model = require("../models/organisation");
const offre_model = require("../models/offre");
const candidature_model = require("../models/candidature");

router.get('/', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (does_user_have_org) {
            let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
            let organisations_types = await organisationsModel.get_organisation_types();
            res.render("organisation/creation", {title: "UT'OPIA - L'avenir", user: req.user, organisations_types: organisations_types, does_user_have_org: does_user_have_org, user_organisation: user_organisation[0], user_status: user_organisation[1]});
        } else {
            let organisations_types = await organisationsModel.get_organisation_types();
            res.render("organisation/creation", {title: "UT'OPIA - L'avenir", user: req.user, organisations_types: organisations_types, does_user_have_org: does_user_have_org});
        }
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.get('/offers', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            res.status(500).redirect('/error/500');
            return
        }

        res.render("organisation/offres", {title: "UT'OPIA - L'avenir", user: req.user});

    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.get('/candidatures',  auth_middleware.is_user_logged_in, async function (req, res, next) {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        res.render('organisation/candidatures', {title: "UT'OPIA - L'avenir", user: req.user});
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/candidatures', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);
        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;
        let output = await candidature_model.get_org_candidatures(req, siren)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/candidatures/edit/:candidature', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);
        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let candidature = req.params.candidature;
        let output = await candidature_model.update_candidature_status(candidature, req.body.status)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

router.post('/candidatures/download/:candidature', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);
        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let candidature = req.params.candidature;
        let output = await candidature_model.get_candidature_docs(candidature)
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});


router.post('/offers', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation = await organisationsModel.get_user_organisation_status(req.user.user_uid);
        let siren = user_organisation[0].siren;
        let output = await offre_model.get_organisation_offres(req, siren)
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

router.delete('/org-members/:member_id', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let does_user_have_org = await organisationsModel.does_user_have_already_org(req.user.user_uid);

        if (!does_user_have_org) {
            throw new Error("User doesn't have an organisation")
        }
        let user_organisation_siren = await organisationsModel.get_user_org(req.user.user_uid);
        let output = await organisationsModel.delete_member(user_organisation_siren, req.params.member_id);
        res.status(200).send(output);
    } catch (e) {
        console.log(e)
        if (e.message === "CANNOT_LEAVE_ORG_WITHOUT_RECRUTEUR") {
            return res.status(500).send({error: "L'utilisateur est le seul recruteur de l'organisation, il ne peut pas la quitter!"});
        }
        res.status(500).send({error: e.message});
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
        res.status(200).send({result: adhesion_result})
    } catch (e) {
        res.status(500).redirect('/error/500');
    }
});

router.post('/restart', auth_middleware.is_user_logged_in, async (req, res) => {
    try {
        let adhesion_result = await organisationsModel.restart_adhesion_process(req.user.user_uid);
        res.status(200).send({result: adhesion_result})
    } catch (e) {
        console.log(e)
        res.status(500).redirect('/error/500');
    }
});

module.exports = router;
