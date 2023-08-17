const mysql = require("mysql2");
const Callback = require("../utils/callback");

const pool = mysql.createConnection({
    host: "",
    user: "SR10",
    password: "",
    database: "",
    port: 3306,
});

module.exports.get_pool = () => {
    return pool;
}

module.exports.test_sql_connection = async () => {
    return new Promise((resolve, reject ) => {
        pool.connect(
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true)
            }
        )
    })
}

module.exports.insert_into_sql = async (sql_request, values) => {
    return new Promise((resolve, reject ) => {
        pool.connect(
            function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                pool.query(sql_request, values, function (err, result) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result.affectedRows);
                });
            }
        )
    })
}

module.exports.verify_existence_sql = async (sql_request, values) => {
    return new Promise(
        (resolve, reject) => {
            pool.connect(
                function (err) {
                    if (err) { reject(err); return;}
                    pool.query(sql_request, values, function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result.length > 0);
                    });
                }
            )
        }
    )
}

module.exports.get_item_from_db = async (sql_request, values) => {
    return new Promise(
        (resolve, reject) => {
            pool.connect(
                function (err) {
                    if (err) { reject(err); return;}
                    pool.query(sql_request, values, function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result[0]);
                    });
                }
            )
        }
    )
}

module.exports.get_items_from_db = async (sql_request, values) => {
    return new Promise(
        (resolve, reject) => {
            pool.connect(
                function (err) {
                    if (err) { reject(err); return;}
                    pool.query(sql_request, values, function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result);
                    });
                }
            )
        }
    )
}

module.exports.execute_query = async (sql_request, values) => {
    return new Promise(
        (resolve, reject) => {
            pool.connect(
                function (err) {
                    if (err) { reject(err); return;}
                    pool.query(sql_request, values, function (err, result) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result);
                    });
                }
            )
        }
    )
}
