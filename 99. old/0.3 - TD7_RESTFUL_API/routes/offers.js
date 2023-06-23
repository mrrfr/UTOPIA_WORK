const APP = require('express');
const offers = require("../models/offers");

const router = APP.Router();

router.get('/', (req, res) => {
    let offersList = offers.getOffers();
    return res.status(200).send({status: true, offers: offersList});
});

router.get('/:userId', (req, res) => {
    return res.status(200).send({status:true});
});

module.exports = router;
