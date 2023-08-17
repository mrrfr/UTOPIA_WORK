const express = require('express');
const router = express.Router();

const Callback = require('../models/utils/callback');
const usersModel = require('../models/users');

router.get('/', (req, res) => {
  res.status(200).send({'message': 'Welcome to the Users API'});
});

module.exports = router;
