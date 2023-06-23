const express = require("express");
const cors = require("cors");
const session = require('express-session');

const users = require('./routes/users');
const offers = require('./routes/offers');

//DEFINE THE APP PORT
const APP_PORT = 3000;
// Define the basic express APP.
const app = express();

// Define session and Session Secret.
app.use(session({
    secret: "EtuBossEtuDOUTESencore?",
    saveUninitialized: true,
    name:"__session",
    cookie: {
        domain: "localhost",
        secure : true,
        httpOnly : true,
        maxAge: 1000*60*5,
    },
}));

// Use Cross Origin Ressource Sharing
app.use(cors());

// Content Type : application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Defines The routes
app.use('/api/users', users);
app.use('/api/offers', offers);

// Start listening.
app.listen(APP_PORT, () =>
    console.log(`APP Is open and listening on PORT : ${APP_PORT}!`),
);
