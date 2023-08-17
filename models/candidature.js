const db = require("./database/db");
const path = require("path");
const uuid = require('uuid');
const fs = require('fs');

module.exports = {
    is_user_allowed_to_candidate: async function(user_id) {
        if (user_id === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT user_uid, nom, prenom, adresse_email, compte_status\n' +
                'FROM utilisateurs\n' +
                'WHERE user_uid = ? AND user_group_uid = 1';
            let sql_values = [user_id.toString()];
            let sql_result = await db.get_item_from_db(select_users, sql_values);

            return sql_result !== undefined;
        } catch (err) {
            throw err
        }
    },

    upload_file: async function(files, candidature_uid, user_uid) {
        Object.keys(files).forEach(key => {
            let file_name = uuid.v4() + "." + files[key].name.split('.').pop();
            const filepath = path.join(__dirname, '../files/files', file_name)
            files[key].mv(filepath, (err) => {
                if (err) throw err
            })

            let sql_insert = 'INSERT INTO candidature_docs (candidature_uid, file_name, file_path, user_uid)\n' +
                'VALUES (?, ?, ?, ?)';
            let sql_vales = [candidature_uid, files[key].name, "/files/" + file_name, user_uid.toString()];
            let sql_result = db.insert_into_sql(sql_insert, sql_vales);

            if (sql_result === undefined) throw new Error("error_while_inserting_file_into_db")
        })
        return true
    },

    get_files: async function(candidature_uid) {
        if (candidature_uid === undefined) {
            throw new Error("candidature_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT *\n' +
                'FROM candidature_docs\n' +
                'WHERE candidature_uid = ?';
            let sql_values = [candidature_uid.toString()];
            let sql_result = await db.get_items_from_db(select_users, sql_values);

            return sql_result;
        } catch (err) {
            throw err
        }
    },

    update_candidature_status: async function(candidature_uid, status) {
        if (candidature_uid === undefined || status === undefined) {
            throw new Error("candidature_id_cannot_be_undefined")
        }
        try {
            let select_users = 'UPDATE candidature SET candidature_status = ? WHERE candidature_uid = ?';
            let sql_values = [status, candidature_uid.toString()];
            let sql_result = await db.execute_query(select_users, sql_values);

            console.log(sql_result)
            console.log(select_users)
            console.log(sql_values)

            return sql_result.affectedRows > 0;
        } catch (err) {
            throw err
        }
    },

    delete_candidature: async function(candidature_uid) {
        if (candidature_uid === undefined) {
            throw new Error("candidature_id_cannot_be_undefined")
        }
        try {
            let delete_candidature_docs = 'DELETE FROM candidature_docs WHERE candidature_uid = ?';
            let sql_values = [parseInt(candidature_uid.toString(), 10)];
            let sql_delete_docs = await db.execute_query(delete_candidature_docs, sql_values);
            let delete_candidature = 'DELETE FROM candidature WHERE candidature_uid = ?';
            let sql_result = await db.execute_query(delete_candidature, sql_values);

            return sql_result.affectedRows > 0;
        } catch (err) {
            throw err
        }
    },

    create_candidature: async function(offre_uid, user_id) {
        if (user_id === undefined || offre_uid === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT COUNT(*) as Total FROM candidature WHERE candidature_offre = ? AND candidat_uid = ?';
            let sql_values = [offre_uid, user_id.toString()];
            let sql_result = await db.get_item_from_db(select_users, sql_values);

            if (sql_result.Total > 0) throw new Error("user_already_applied_to_this_offer")

            let todayDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            let insert_candidature = 'INSERT INTO candidature (candidature_offre, candidat_uid, candidature_date, candidature_status)\n' +
                'VALUES (?, ?, ?, ?)';
            let insert_candidature_values = [offre_uid, user_id, todayDate, 1];
            let sql_insert_result = await db.insert_into_sql(insert_candidature, insert_candidature_values);

            if (sql_insert_result === undefined) throw new Error("error_while_inserting_candidature_into_db")

            select_users = 'SELECT * FROM candidature WHERE candidature_offre = ? AND candidat_uid = ?';
            return await db.get_item_from_db(select_users, [parseInt(offre_uid, 10), parseInt(user_id, 10)]);
        } catch (err) {
            throw err
        }
    },

    get_candidature: async function(candidature_uid) {
        if (candidature_uid === undefined) {
            throw new Error("user_id_cannot_be_undefined")
        }
        try {
            let select_users = 'SELECT *\n' +
                'FROM candidature\n' +
                'WHERE candidature_uid = ?';
            let sql_values = [candidature_uid.toString()];
            return await db.get_item_from_db(select_users, sql_values);
        } catch (err) {
            throw err
        }
    },

    get_user_candidature: async function(user_uid, offre_uid) {
        if (user_uid === undefined || offre_uid === undefined) {
            throw new Error("INCORRECT_PARAMETERS")
        }
        try {
            let select_users = 'SELECT *\n' +
                'FROM candidature\n' +
                'WHERE candidat_uid = ? AND candidature_offre = ?';
            let sql_values = [user_uid.toString(), offre_uid.toString()];
            return  await db.get_item_from_db(select_users, sql_values);
        } catch (err) {
            throw err
        }
    },

    delete_doc: async function(doc_uid, user_id) {
        if (doc_uid === undefined) {
            throw new Error("doc_id_cannot_be_undefined")
        }
        try {
            let select_sql_doc = 'SELECT *\n' +
                'FROM candidature_docs\n' +
                'WHERE doc_uid = ?';
            let sql_doc_values = [doc_uid.toString()];
            let doc = await db.get_item_from_db(select_sql_doc, sql_doc_values);
            const filepath = path.join(__dirname, '../files/files', doc.file_path.split('/').pop());

            fs.unlink(filepath, (err) => {
                if (err) throw err;
            });


            let delete_doc = 'DELETE FROM candidature_docs WHERE doc_uid = ?;';
            let sql_values = [doc_uid.toString()];
            if (user_id !== undefined) {
                delete_doc = 'DELETE FROM candidature_docs WHERE doc_uid = ? AND user_uid = ?;';
                sql_values.push(user_id.toString())
            }
            let output = await db.execute_query(delete_doc, sql_values);
            return output.affectedRows > 0;
        } catch (err) {
            throw err
        }
    },


    get_user_candidatures: async function(req, user_uid) {
        return new Promise((resolve, reject) => {
            let draw = req.body.draw;
            let start = req.body.start;
            let length = req.body.length;
            let order_data = req.body.order;

            let column_name;
            let column_sort_order;

            if(typeof order_data == 'undefined')
            {
                column_name = 'date_validite';
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

            let search_query = "";
            let sql_values = [];

            if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                console.log("filter", req.body.filter)
                search_query += ` WHERE pt.pos_type_name = ? AND candidat_uid = ${parseInt(user_uid, 10)}`
                sql_values.push(req.body.filter)
            } else {
                search_query += ` WHERE candidat_uid = ${parseInt(user_uid, 10)}`
            }

            search_query += ` AND (nom LIKE ? 
                                OR intitule LIKE ? 
                                OR status_poste LIKE ? 
                                OR type_metier LIKE ? 
                                OR adresse LIKE ? 
                                OR salaire LIKE ? 
                                OR rythme LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%"
            } else {
                search_value = `%${search_value}%`
            }

            for (let i=0; i<7; i++) {
                sql_values.push(search_value)
            }

            let base_query = `SELECT * FROM candidature INNER JOIN offres o on candidature.candidature_offre = o.offre_uid INNER JOIN organisations o2 on o.organisations_uid = o2.siren INNER JOIN positions_type pt on candidature.candidature_status = pt.pos_type_uid`
            let base_count_query = `SELECT COUNT(*) As Total FROM candidature INNER JOIN offres o on candidature.candidature_offre = o.offre_uid INNER JOIN organisations o2 on o.organisations_uid = o2.siren INNER JOIN positions_type pt on candidature.candidature_status = pt.pos_type_uid`

            db.get_pool().query(
                `${base_count_query} WHERE candidat_uid = ${user_uid}`, function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    db.get_pool().query(`${base_count_query} ${search_query}`, sql_values, function(error, data){
                        if (error) throw error;
                        let total_records_with_filter = data[0].Total;
                        let query = `${base_query} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                        let data_arr = [];

                        let q = db.get_pool().query(query, sql_values, function(error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(async function(row){
                                data_arr.push({
                                    'candidature_uid' : row.candidature_uid,
                                    'offre_uid' : row.offre_uid,
                                    'nom_org' : row.nom,
                                    'intitule' : `${row.intitule} \n${row.status_poste}`,
                                    'type' : row.type_metier,
                                    'adresse' : row.adresse,
                                    'salaire' : row.salaire,
                                    'rythme' : row.rythme,
                                    'candidature_status' : row.pos_type_name,
                                    'candidature_status_n' : row.pos_type_uid,
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

    },

    get_org_candidatures: async function(req, siren) {
        return new Promise((resolve, reject) => {
            let draw = req.body.draw;
            let start = req.body.start;
            let length = req.body.length;
            let order_data = req.body.order;

            let column_name;
            let column_sort_order;

            if(typeof order_data == 'undefined')
            {
                column_name = 'date_validite';
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


            let search_query = `AND (u.nom LIKE ? 
                                OR u.prenom LIKE ? 
                                OR u.adresse_email LIKE ? 
                                OR u.tel LIKE ? 
                                OR pt.pos_type_name LIKE ? 
                                OR salaire LIKE ? 
                                OR rythme LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%"
            } else {
                search_value = `%${search_value}%`
            }

            let sql_values = Array(7).fill(search_value)

            let base_query = `SELECT * FROM candidature INNER JOIN offres o on candidature.candidature_offre = o.offre_uid INNER JOIN utilisateurs u on candidature.candidat_uid = u.user_uid INNER JOIN positions_type pt on candidature.candidature_status = pt.pos_type_uid`
            let base_count_query = `SELECT COUNT(*) As Total FROM candidature INNER JOIN utilisateurs u on candidature.candidat_uid = u.user_uid INNER JOIN offres o on candidature.candidature_offre = o.offre_uid INNER JOIN positions_type pt on candidature.candidature_status = pt.pos_type_uid`


            if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                search_query += ` WHERE pt.pos_type_name = '${req.body.filter}' AND organisations_uid = '${siren}'`
            } else {
                search_query += ` WHERE organisations_uid = '${siren}' AND pt.pos_type_uid != 1`
            }

            db.get_pool().query(
                `${base_count_query} WHERE organisations_uid = '${siren}'`, function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    db.get_pool().query(`${base_count_query} ${search_query}`, sql_values, function(error, data){
                        if (error) throw error;
                        let total_records_with_filter = data[0].Total;
                        let query = `${base_query} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                        let data_arr = [];

                        db.get_pool().query(query, sql_values, function(error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(async function(row){
                                data_arr.push({
                                    'candidature_uid' : row.candidature_uid,
                                    'offre_uid' : row.offre_uid,
                                    'nom_candidat' : row.nom,
                                    'prenom_candidat' : row.prenom,
                                    'mail_candidat' : row.adresse_email,
                                    'tel_candidat' : row.tel,
                                    'candidature_status' : row.pos_type_name,
                                    'candidature_status_n' : row.pos_type_uid,
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

    },

    get_candidature_docs : async function(candidature_uid) {
        if (candidature_uid === undefined) {
            throw new Error("Missing parameters")
        }
        return new Promise(
            async (resolve) => {
                try {
                    let select_users = 'SELECT *\n' +
                        'FROM candidature_docs\n' +
                        'WHERE candidature_uid = ?';
                    let sql_values = [candidature_uid.toString()];
                    let output = await db.get_items_from_db(select_users, sql_values);
                    resolve(output)
                } catch (err) {
                    throw err
                }
            }
        )
    },

    get_offre_by_id: async function(siren, offre_uid) {
        if(siren === undefined || offre_uid === undefined) {
            throw new Error("Missing parameters")
        }
        return new Promise((resolve, reject) => {
            db.get_pool().query(
                "SELECT * FROM offres WHERE organisations_uid = ? AND offre_uid = ?", [siren, offre_uid], function (err, result) {
                    if (err) throw err;
                    resolve(result[0])
                }
            )
        })
    },
}
