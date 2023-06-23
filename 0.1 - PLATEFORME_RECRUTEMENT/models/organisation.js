const db = require("./database/db");
const axios = require("axios");

module.exports = {
    get_organisation_types: async function () {
        try {
            let select_users = 'SELECT *\n' +
                'FROM organisations_type';
            let sql_result = await db.get_items_from_db(select_users, []);

            if (sql_result !== undefined && sql_result !== null) {
                return sql_result;
            }
            throw new Error("CANNOT_GET_ORGANISATION_TYPES");
        } catch (err) {
            throw err
        }
    },

    does_user_have_already_org: async function(user_id) {
        let sql_select = 'SELECT *\n' +
            'FROM users_organisation\n' +
            'WHERE user_uid = ?'

        let select_result = await db.get_items_from_db(sql_select, [user_id]);

        return select_result !== undefined && select_result !== null && select_result.length > 0;
    },

    get_user_organisation_status: async function(user_id) {
        try {
            let sql_select = 'SELECT *\n' +
                'FROM users_organisation\n' +
                'WHERE user_uid = ?'

            let select_result = await db.get_item_from_db(sql_select, [user_id]);
            let org_siren = select_result["organisation_uid"];

            if (org_siren === undefined || org_siren === null || org_siren === "" || org_siren === 0) {
                throw new Error("USER_DONT_HAS_ORGANISATION")
            }

            return [
                await db.get_item_from_db('SELECT * FROM organisations INNER JOIN organisations_type ot on organisations.organisation_type = ot.type_uid WHERE siren = ?', [org_siren]),
                select_result["user_status"]
            ]
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    rejoindre_org: async function(user_id,siren) {
        try {
            let sql_insert = 'INSERT INTO users_organisation\n' +
                '(user_uid, organisation_uid, user_status) \n' +
                'values (?, ?, ?)'

            let sql_values = [user_id, siren, "EN ATTENTE DE CONFIRMATION"];

            let select_result = await db.execute_query(sql_insert, sql_values);
            console.log(select_result)

            return select_result !== undefined && select_result["affectedRows"] === 1;
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    update_org_member_status: async function(user_id, siren, nouveau_status) {
        try {
            if (user_id === undefined || siren === undefined || nouveau_status === undefined) {
                throw new Error("MISSING_PARAMETERS")
            }
            let update_user = 'UPDATE users_organisation\n' +
                '        SET user_status = ?\n' +
                '        WHERE organisation_uid = ? AND user_uid = ?';
            let sql_values = [nouveau_status, siren, user_id];
            let sql_result = await db.execute_query(update_user, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            if(nouveau_status !== "ACCEPTÉE") {
                return sql_result["affectedRows"] === 1;
            }

            update_user = 'UPDATE utilisateurs\n' +
                '        SET user_group_uid = ?\n' +
                '        WHERE user_uid = ?';
            sql_values = [2, user_id];
            sql_result = await db.execute_query(update_user, sql_values);

            if (sql_result === undefined || sql_result["affectedRows"] === 0 ) {
                throw new Error("CANNOT_UPDATE_ORGANISATION_STATUS")
            }

            return sql_result["affectedRows"] === 1;
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    delete_member: async function(siren, user_uid) {
        if (siren === undefined || user_uid === undefined) {
            throw new Error("MISSING_PARAMETERS")
        }

        let sql_select = 'SELECT COUNT(*) as Total\n' +
            'FROM organisations\n' +
            'WHERE siren = ?'

        let select_result = await db.get_item_from_db(sql_select, [siren]);
        if (select_result["Total"] - 1 === 0) {
            throw new Error("CANNOT_LEAVE_ORG_WITHOUT_RECRUTEUR")
        }
        console.log("test")
        return
    },

    restart_adhesion_process: async function(user_uid) {
        if (user_uid === undefined) {
            throw new Error("MISSING_PARAMETERS")
        }

        let sql_select = 'SELECT COUNT(*) as Total\n' +
            'FROM users_organisation\n' +
            'WHERE user_uid = ? AND user_status = "REFUSÉE"'

        let select_result = await db.get_item_from_db(sql_select, [user_uid]);
        if (select_result["Total"] !== 1) {
            throw new Error("CANNOT_FIND_USER")
        }

        sql_select = 'SELECT COUNT(*) as Total\n' +
            'FROM utilisateurs\n' +
            'WHERE user_uid = ? AND user_group_uid = 1'

        select_result = await db.get_item_from_db(sql_select, [user_uid]);
        if (select_result["Total"] !== 1) {
            throw new Error("CANNOT_FIND_USER")
        }

        let sql_delete = 'DELETE FROM users_organisation where user_uid = ?'
        let delete_result = await db.execute_query(sql_delete, [user_uid]);

        return delete_result["affectedRows"] === 1;
    },

    get_user_org: async function(user_id) {
        try {
            let sql_select = 'SELECT *\n' +
                'FROM users_organisation\n' +
                'WHERE user_uid = ?'

            let select_result = await db.get_item_from_db(sql_select, [user_id]);
            if (select_result === undefined || select_result === null || select_result === "" || select_result === 0) {
                throw new Error("USER_DONT_HAS_ORGANISATION")
            }

            return select_result["organisation_uid"];
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    get_user_organisation_members: async function(user_id, siren, req) {
        try {

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
                    if(column_name === 'nom') {
                        column_name = 'u.nom'
                    }
                    if(column_name === 'user_uid') {
                        column_name = 'u.user_uid'
                    }
                    if (column_sort_order !== "desc" && column_sort_order !== "asc") {
                        throw new Error("Invalid column sort order")
                    }
                }

                let base = 'SELECT * FROM organisations\n' +
                    'INNER JOIN users_organisation uo on uo.organisation_uid = siren\n' +
                    'INNER JOIN utilisateurs u on uo.user_uid = u.user_uid\n' +
                    `AND uo.organisation_uid  = ${siren}`

                let base_count = 'SELECT COUNT(*) AS Total FROM organisations\n' +
                    'INNER JOIN users_organisation uo on uo.organisation_uid = siren\n' +
                    'INNER JOIN utilisateurs u on uo.user_uid = u.user_uid\n' +
                    `AND uo.organisation_uid = ${siren}`

                let search_value = req.body.search['value'];


                let search_query = `AND (user_status LIKE ?
                                OR u.nom LIKE ?
                                OR u.prenom LIKE ?
                                OR u.adresse_email LIKE ?
                                OR u.tel LIKE ?
                                OR u.compte_status LIKE ?)`;

                if(search_value === undefined || search_value === null || search_value === "") {
                    search_value = "%"
                } else {
                    search_value = `%${search_value}%`
                }

                let sql_values = Array(6).fill(search_value);

                if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                    search_query += ` AND user_status = '${req.body.filter}'`
                }


                db.get_pool().query(
                    base, function (err, result) {
                        if (err) throw err;
                        let total_records = result[0].Total;

                        db.get_pool().query(base_count, function(error, data){
                            if (error) throw error;
                            let total_records_with_filter = data[0].Total;
                            let query = `${base} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                            let data_arr = [];

                            db.get_pool().query(query, sql_values, function(error, data){
                                if (error) {
                                    console.log(error)
                                    throw err;
                                }
                                data.forEach(function(row){
                                    data_arr.push({
                                        'user_uid': row.user_uid,
                                        'nom': row.nom,
                                        'prenom': row.prenom,
                                        'adresse_email': row.adresse_email,
                                        'tel': row.tel,
                                        'compte_status': row.compte_status,
                                        'user_status': row.user_status,
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
        } catch (e) {
            console.log(e)
            throw e;
        }
    },

    create_offre: async function(user_id, siren, data) {
        let exp_date = new Date(data.date);
        let intitule = data.intitule;
        let loc_long = data.loc_long;
        let loc_lat = data.loc_lat;
        let nb_pieces = data.nb_pieces;
        let pieces = data.piece;
        let responsable = data.responsable;
        let rythme = data.rythme;
        let status_poste = data.status_poste;
        let type = data.type;
        let status = data.status;
        let salaire = data.salaire;

        if (
            exp_date === undefined || intitule === undefined || loc_long === undefined ||
            nb_pieces === undefined || pieces === undefined || responsable === undefined ||
            rythme === undefined || status_poste === undefined || type === undefined ||
            status === undefined || loc_lat === undefined || salaire === undefined
        ) {
            throw new Error("INVALID_DATA");
        }

        let city_fetch = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc_lat},${loc_long}&sensor=false&key=AIzaSyCMy-hj1vTMWe303mkUGIY9bnapDW3nsr0`)
        let addresse = city_fetch.data.results[0]['formatted_address'];

        let sql_insert = 'INSERT INTO offres ' +
            '(organisations_uid, intitule, status_poste, responsable, type_metier, lieu_mission_lat, lieu_mission_long, rythme, date_validite, pieces_demandes, nb_piece_demandes, etat_offre, adresse, salaire) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        let sql_values = [siren, intitule, status_poste, responsable, type, loc_lat, loc_long, rythme, exp_date, pieces, nb_pieces, status, addresse, salaire];
        let result = await db.get_pool().query(sql_insert, sql_values);
        return result !== undefined && result !== null && result.affectedRows === 1;
    },

    create_organisation: async function (user_id, data) {
        try {
            if (await this.does_user_have_already_org(user_id)) {
                throw new Error("USER_ALREADY_HAS_ORGANISATION");
            }

            if (
                data.siren === undefined || data.siren === null || data.siren === "" ||
                data.nom_organisation === undefined || data.nom_organisation === null || data.nom_organisation === "" ||
                data.type_organisation === undefined || data.type_organisation === null || data.type_organisation === "" ||
                data.siege === undefined || data.siege === null || data.siege === ""
            ) {
                throw new Error("INVALID_DATA");
            }


            let select_users = 'INSERT INTO SR10.organisations (siren, nom, organisation_type, siege, status) VALUES (?, ?, ?, ?, ?)';
            let sql_values = [data.siren, data.nom_organisation, data.type_organisation, data.siege, "EN ATTENTE DE CONFIRMATION"]

            let sql_result = await db.execute_query(select_users, sql_values);

            if (sql_result !== undefined && sql_result["affectedRows"] > 0) {
                let insert_user = 'INSERT INTO SR10.users_organisation (user_uid, organisation_uid, user_status) VALUES (?, ? , ?)';
                let sql_insert_values = [user_id, data.siren, "EN ATTENTE"]
                let sql_result = await db.execute_query(insert_user, sql_insert_values);
                if (sql_result !== undefined && sql_result["affectedRows"] > 0) {
                    return true;
                } else {
                    throw new Error("CANNOT_CREATE_ORGANISATION");
                }
            }
            throw new Error("CANNOT_GET_ORGANISATION_TYPES");
        } catch (err) {
            console.log(err)
            throw err
        }
    },

    get_organisations: async function(req) {
        return new Promise((resolve, reject) => {
            let draw = req.body.draw;
            let start = req.body.start;
            let length = req.body.length;
            let order_data = req.body.order;

            let column_name;
            let column_sort_order;

            if(typeof order_data == 'undefined')
            {
                column_name = 'organisations.siren';
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

            if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                console.log("filter")
                search_query += `WHERE status = '${req.body.filter}'`

            } else {
                console.log("no filter")
                search_query += ` WHERE 1`
            }


            search_query += ` AND (status LIKE ?
                                OR siege LIKE ?
                                OR type_name LIKE ?
                                OR nom LIKE ? 
                                OR siren LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%"
            } else {
                search_value = `%${search_value}%`
            }

            let sql_values = Array(5).fill(search_value);



            db.get_pool().query(
                "SELECT COUNT(*) AS Total FROM organisations", function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    let q = db.get_pool().query(`SELECT COUNT(*) AS Total FROM organisations INNER JOIN organisations_type ot on organisations.organisation_type = ot.type_uid ${search_query}`, sql_values, function(error, data){
                        console.log(q.sql)
                        if (error) throw error;
                        let total_records_with_filter = data[0].Total;
                        let baseQuery = "SELECT * FROM organisations INNER JOIN organisations_type ot on organisations.organisation_type = ot.type_uid"
                        let query = `${baseQuery} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                        let data_arr = [];

                        db.get_pool().query(query, sql_values, function (error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(function(row){
                                data_arr.push({
                                    'siren' : row.siren,
                                    'nom' : row.nom,
                                    'type' : row.type_name,
                                    'adresse_siege' : row.siege,
                                    'status' : row.status,
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
