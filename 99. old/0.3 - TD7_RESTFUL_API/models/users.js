const fs = require('fs');
const path = require('path');

module.exports.getUsers = () => {
    try {
        let usersPath = path.resolve(__dirname, './data/users.json');
        console.log('Path of users file :', usersPath);
        let rawData = fs.readFileSync(usersPath);
        return JSON.parse(rawData).users;
    } catch (err) {
        console.log(err);
        throw new Error('CANNOT_READ_USER_DATA');
    }
}

module.exports.getUserById = (id) => {
    try {
        let usersPath = path.resolve(__dirname, './data/users.json');
        console.log('Path of users file :', usersPath);
        let rawData = fs.readFileSync(usersPath);
        let selectedUser = JSON.parse(rawData).users.find((usr) => JSON.parse(usr.id) === id);

        JSON.parse(rawData).users.forEach(
            (usr) => {
                console.log(JSON.parse(usr));
            }
        )

        if (selectedUser === undefined) {
            throw new Error('CANNOT_READ_USER_DATA');
        }

        return JSON.parse(rawData).users;
    } catch (err) {
        console.log(err);
        throw new Error('CANNOT_READ_USER_DATA');
    }
}



module.exports.insertUser = async (first_name, last_name, email) => {
    try {
        if (first_name === undefined || last_name === undefined || email === undefined) throw new Error('CANNOT_RECIVE_UNDEFIENDED_DATA');

        let usersPath = path.resolve(__dirname, './data/users.json');
        let rawData = fs.readFileSync(usersPath);

        let data = JSON.parse(rawData).users;

        data.push(
            {
                id: data.length + 1,
                first_name: first_name,
                last_name: last_name,
                email: email,
            }
        )

        await fs.writeFile(usersPath, JSON.stringify({users:data}, null, "\t"), async (err) => {
            if (err) throw err;
        });

        return JSON.parse(rawData).users;
    } catch (err) {
        console.log(err);
        throw new Error('CANNOT_READ_USER_DATA');
    }
}

module.exports.deleteUser = async (id) => {
    try {
        if (id === undefined) throw new Error('CANNOT_ID_UNDEFIENDED_DATA');

        let usersPath = path.resolve(__dirname, './data/users.json');
        let rawData = fs.readFileSync(usersPath);

        let data = JSON.parse(rawData).users;

        data.push(
            {
                id: data.length + 1,
                first_name: first_name,
                last_name: last_name,
                email: email,
            }
        )

        await fs.writeFile(usersPath, JSON.stringify({users:data}, null, "\t"), async (err) => {
            if (err) throw err;
        });

        return JSON.parse(rawData).users;
    } catch (err) {
        console.log(err);
        throw new Error('CANNOT_READ_USER_DATA');
    }
}

