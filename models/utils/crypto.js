const crypto = require("models/utils/crypto");
const apiKeys = require("./keys");

module.exports.create_hash = (string_to_hash) => {
    let key = crypto.createHash('sha256').update(String(apiKeys.keys.crypto.key)).digest('base64').substr(0, 32);
    let cipher = crypto.createCipheriv(apiKeys.keys.crypto.algorithm, key, apiKeys.keys.crypto.iv);
    return  cipher.update(string_to_hash, 'utf8', 'hex') + cipher.final('hex');
}
