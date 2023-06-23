const fs = require('fs');
const path = require('path');

module.exports.getOffers = () => {
    try {
        let offersPath = path.resolve(__dirname, './data/offers.json');
        console.log('Path of users file :', offersPath);
        let rawData = fs.readFileSync(offersPath);
        return JSON.parse(rawData).offers;
    } catch (err) {
        console.log(err);
        throw new Error('CANNOT_READ_USER_DATA');
    }
}
