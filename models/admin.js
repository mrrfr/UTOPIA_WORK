const db = require("./database/db");

module.exports = {
    is_user_admin: async function (user_id) {
        if (user_id === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT user_uid, nom, prenom, adresse_email, compte_status\n' +
                'FROM utilisateurs\n' +
                'WHERE user_uid = ? AND user_group_uid = 3';
            let sql_values = [user_id.toString()];
            let sql_result = await db.get_item_from_db(select_users, sql_values);

            return sql_result !== undefined;
        } catch (err) {
            throw err
        }
    },

    delete_user: async function(user_id) {
        if (user_id === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT user_uid, user_group_uid, nom, prenom, adresse_email, compte_status\n' +
                'FROM utilisateurs\n' +
                'WHERE user_uid = ?';
            let sql_select_values = [user_id.toString()];
            let sql_select_result = await db.get_item_from_db(select_users, sql_select_values);

            if (sql_select_result["user_group_uid"] === 3) {
                throw new Error("CANNOT_DELETE_ADMINISTRATOR")
            }

            if (sql_select_result === undefined && sql_select_result === null) {
                throw new Error("CANNOT_DELETE_VOID")
            }

            let delete_query = 'DELETE\n' +
                'FROM utilisateurs\n' +
                'WHERE user_uid = ?';
            let sql_values = [user_id.toString()];
            let sql_result = await db.execute_query(delete_query, sql_values);

            return sql_result !== undefined && sql_result["affectedRows"] === 1;
        } catch (err) {
            throw err
        }
    },

    update_user: async function(user_id, data) {
        if (user_id === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let update_user = 'UPDATE utilisateurs\n' +
                '        SET nom = ?, prenom = ?, adresse_email = ?, tel = ? , user_group_uid = ?\n' +
                '        WHERE user_uid = ?';
            let sql_values = [data.nom_famille.toString(), data.prenom.toString(), data.adresse_email.toString(), data.tel.toString(), parseInt(data.role, 10),  user_id.toString()];
            let sql_result = await db.execute_query(update_user, sql_values);

            return sql_result !== undefined && sql_result["affectedRows"] === 1;
        } catch (err) {
            throw err
        }
    },

    delete_organisation: async function(siren) {
        try {
            if (siren === undefined || siren === null || siren === "") {
                throw new Error("MISSING_PARAMETERS")
            }

            let sql_delete = 'DELETE FROM organisations where siren = ?'
            let delete_result = await db.execute_query(sql_delete, [siren]);

            return delete_result !== undefined && delete_result["affectedRows"] === 1;
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    update_org_status: async function(siren, nouveau_status) {
        if (siren === undefined) {
            throw new Error("SIREN_CANNOT_BE_UNDEFINED")
        }
        try {
            let update_user = 'UPDATE organisations\n' +
                '        SET status = ?\n' +
                '        WHERE siren = ?';
            let sql_values = [nouveau_status, siren];
            let sql_result = await db.execute_query(update_user, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            update_user = 'UPDATE users_organisation\n' +
                '        SET user_status = ?\n' +
                '        WHERE organisation_uid = ?';
            sql_values = [nouveau_status, siren];
            sql_result = await db.execute_query(update_user, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            if(nouveau_status !== "ACCEPTÉE") {
                return sql_result["affectedRows"] === 1;
            }

            let user_id_select = 'SELECT user_uid\n' +
                'FROM users_organisation\n' +
                'WHERE organisation_uid = ?';
            sql_values = [siren];
            sql_result = await db.get_item_from_db(user_id_select, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            let user_uid = sql_result.user_uid;

            update_user = 'UPDATE utilisateurs\n' +
                '        SET user_group_uid = ?\n' +
                '        WHERE user_uid = ?';
            sql_values = [2, user_uid];
            sql_result = await db.execute_query(update_user, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            return sql_result["affectedRows"] === 1;
        } catch (err) {
            throw err
        }
    },

    get_users: async function(req) {
        return new Promise((resolve, reject) => {
            let draw = req.body.draw;
            let start = req.body.start;
            let length = req.body.length;
            let order_data = req.body.order;

            let column_name;
            let column_sort_order;

            if(typeof order_data == 'undefined')
            {
                column_name = 'utilisateurs.user_uid';
                column_sort_order = 'desc';
            }
            else
            {
                let column_index = req.body.order[0]['column'];
                column_name = req.body.columns[column_index]['data'];
                column_sort_order = req.body.order[0]['dir'];
                if (column_sort_order !== "desc" && column_sort_order !== "asc") {
                    throw new Error("Invalid column sort order")
                }
            }

            let search_value = req.body.search['value'];

            if (search_value !== undefined && search_value !== ' ') {
                if (search_value === "UTILISATEUR") {
                    search_value = 1;
                } else if (search_value === "RECRUTEUR") {
                    search_value = 2;
                } else if (search_value === "ADMINISTRATEUR") {
                    search_value = 3;
                }

                if(search_value.includes("-")) {
                    let values = search_value.split("-");
                    let temp = ""
                    for (let i = 0; i < values.length; i++) {
                        temp += "-" + values[i]
                    }
                    temp = temp.slice(1, temp.length)
                    temp = temp.split('-').reverse().join('-')
                    search_value = temp
                }
            }

            let search_query = `AND (user_uid LIKE ? 
                                OR adresse_email LIKE ? 
                                OR tel LIKE ? 
                                OR user_group_uid LIKE ? 
                                OR compte_status LIKE ? 
                                OR date_creation LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%%"
            } else {
                search_value = `%${search_value}%`
            }

            let search_values = [search_value, search_value, search_value, search_value, search_value, search_value];

            db.get_pool().query(
                "SELECT COUNT(*) AS Total FROM utilisateurs", function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    db.get_pool().query(`SELECT COUNT(*) AS Total FROM utilisateurs WHERE 1`, search_values, function(error, data){

                        let total_records_with_filter = data[0].Total;
                        let baseQuery = "SELECT * FROM utilisateurs INNER JOIN `groups` g on utilisateurs.user_group_uid = g.group_uid WHERE 1"
                        let query = `${baseQuery} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                        let data_arr = [];

                        db.get_pool().query(query, search_values,  function(error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(function(row){
                                data_arr.push({
                                    'user_uid' : row.user_uid,
                                    'nom' : row.nom,
                                    'prenom' : row.prenom,
                                    'adresse_email' : row.adresse_email,
                                    'tel' : row.tel,
                                    'compte_status' : row.compte_status,
                                    'date_creation' : new Date(row.date_creation).toLocaleDateString("fr"),
                                    'user_group_uid' : row.group_name
                                });
                            });

                            let output = {
                                'draw' : draw,
                                'iTotalRecords' : total_records,
                                'iTotalDisplayRecords' : total_records_with_filter,
                                'aaData' : data_arr
                            };
                            resolve(output)
                        });

                    });
                }
            )
        })

    }
}
