const APP = require('express');
const users = require('../models/users');

const router = APP.Router();

router.get('/', (req, res) => {
    let usersList = users.getUsers();
    return res.status(200).send({status: true, users: usersList});
});

router.post('/', (req, res) => {
    let usersList = users.insertUser(req.body.first_name, req.body.last_name, req.body.email);
    return res.status(200).send({status: true, users: usersList});
});

router.get('/:userId', (req, res) => {
    try {
        let selectedUser = users.getUserById(req.params.userId);
        return res.status(200).send({status:true, user: selectedUser});
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
