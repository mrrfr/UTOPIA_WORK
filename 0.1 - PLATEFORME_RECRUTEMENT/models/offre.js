const db = require("./database/db");
const axios = require('axios');
const Console = require("console");

module.exports = {

    get_organisation_offres: async function(req, siren) {
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


            let search_query = `AND (nb_piece_demandes LIKE ? 
                                OR rythme LIKE ? 
                                OR date_validite LIKE ? 
                                OR responsable LIKE ? 
                                OR adresse LIKE ? 
                                OR type_metier LIKE ? 
                                OR status_poste LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%"
            } else {
                search_value = `%${search_value}%`
            }

            let search_values = [search_value, search_value, search_value, search_value, search_value, search_value, search_value]

            let base_query = `SELECT * FROM offres INNER JOIN etat_offre eo on offres.etat_offre = eo.etat_uid`
            let base_count_query = `SELECT COUNT(*) As Total FROM offres INNER JOIN etat_offre eo on offres.etat_offre = eo.etat_uid`


            if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                search_query += ` WHERE eo.etat_name = '${req.body.filter}' AND organisations_uid = '${siren}'`
            } else {
                search_query += ` WHERE organisations_uid = ${siren}`
            }

            db.get_pool().query(
                `${base_count_query} WHERE organisations_uid = ${siren}`, function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    db.get_pool().query(`${base_count_query} ${search_query}`, search_values, function(error, data){
                        if (error) throw error;
                        let total_records_with_filter = data[0].Total;
                        let query = `${base_query} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ${start}, ${length}`;

                        let data_arr = [];

                        db.get_pool().query(query, search_values, function(error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(async function(row){
                                data_arr.push({
                                    'intitule' : `${row.intitule} \n${row.status_poste}`,
                                    'nb_piece_demandes' : row.nb_piece_demandes,
                                    'pieces_demandes' : row.pieces_demandes,
                                    'etat_offre' : row.etat_name,
                                    'salaire' : row.salaire,
                                    'lat_long' : row.adresse,
                                    'rythme' : row.rythme,
                                    'date_validite' : (new Date(row.date_validite)).toDateString(),
                                    'responsable' : row.responsable,
                                    'type_metier' : row.type_metier,
                                    'offre_uid' : row.offre_uid,
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

    get_offers: async function(req) {
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

            let search_query = "";

            if (req.body.expirer === undefined || req.body.expirer === null || req.body.expirer === "false") {
                search_query += ` WHERE offres.etat_offre = 2 AND offres.date_validite > cast((now()) as date)`
            } else {
                search_query += ` WHERE (offres.etat_offre = 2 OR offres.etat_offre = 3) AND offres.date_validite < cast((now()) as date)`
            }

            let search_value = req.body.search['value'];


            search_query += ` AND (nb_piece_demandes LIKE ? 
                                OR rythme LIKE ? 
                                OR date_validite LIKE ? 
                                OR responsable LIKE ? 
                                OR adresse LIKE ? 
                                OR type_metier LIKE ? 
                                OR status_poste LIKE ?)`;

            if(search_value === undefined || search_value === null || search_value === "") {
                search_value = "%%"
            } else {
                search_value = `%${search_value}%`
            }

            let search_values = [search_value, search_value, search_value, search_value, search_value, search_value, search_value]

            let base_query = `SELECT * FROM offres INNER JOIN etat_offre eo on offres.etat_offre = eo.etat_uid`
            let base_count_query = `SELECT COUNT(*) As Total FROM offres INNER JOIN etat_offre eo on offres.etat_offre = eo.etat_uid`

            if(req.body.filter !== undefined && req.body.filter !== null && req.body.filter !== "") {
                search_query += `  AND eo.etat_name = ?`
                search_values.push(req.body.filter)
            }

            if(req.body.salaire !== undefined && req.body.salaire !== null && req.body.salaire !== "") {
                search_query += ` AND salaire >= ?`
                search_values.push(req.body.salaire)
            }

            if(req.body.distance !== undefined && req.body.distance !== null && req.body.distance !== "") {
                let lat = req.body.localisation.lat;
                let long = req.body.localisation.long;
                search_query += ` AND SQRT(POWER(69.1 * ( ? - offres.lieu_mission_lat),  2) +
                                  POWER(69.1 * ( offres.lieu_mission_long  - ? )  * COS(? / 57.3), 2)) < ?`
                search_values.push(lat, long, lat, req.body.distance)
            }

            db.get_pool().query(
                `${base_count_query}`, function (err, result) {
                    if (err) throw err;
                    let total_records = result[0].Total;

                    db.get_pool().query(`${base_count_query} ${search_query}`, search_values, function(error, data){
                        if (error) throw error;
                        let total_records_with_filter = data[0].Total;
                        let query = `${base_query} ${search_query} ORDER BY ${column_name} ${column_sort_order} LIMIT ?, ?`;
                        search_values.push(parseInt(start, 10), parseInt(length, 10))

                        let data_arr = [];

                        let q = db.get_pool().query(query, search_values, function(error, data){
                            if (error) {
                                console.log(error)
                                throw err;
                            }
                            data.forEach(async function(row){
                                console.log(row)
                                let expiree = ((new Date(row.date_validite)) < (new Date(Date.now())))
                                data_arr.push({
                                    'intitule' : `${row.intitule} \n${row.status_poste}`,
                                    'nb_piece_demandes' : row.nb_piece_demandes,
                                    'pieces_demandes' : row.pieces_demandes,
                                    'etat_offre' : row.etat_name,
                                    'salaire' : row.salaire,
                                    'expiree' : expiree,
                                    'lat_long' : row.adresse,
                                    'rythme' : row.rythme,
                                    'date_validite' : (new Date(row.date_validite)).toDateString(),
                                    'responsable' : row.responsable,
                                    'type_metier' : row.type_metier,
                                    'offre_uid' : row.offre_uid,
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

    get_offre_by_id_without_siren: async function(offre_uid) {
        if(offre_uid === undefined) {
            throw new Error("Missing parameters")
        }
        return new Promise((resolve, reject) => {
            try {
                db.get_pool().query(
                    "SELECT * FROM offres WHERE offre_uid = ? AND offres.date_validite > now()", [offre_uid], function (err, result) {
                        if (err) throw err;
                        resolve(result[0])
                    }
                )
            } catch (e) {
                console.log(e)
                return reject(e)
            }
        })
    },

    delete_offre_by_id: async function(siren, offre_uid) {
        if(siren === undefined || offre_uid === undefined) {
            throw new Error("Missing parameters")
        }
        let result = await db.execute_query("DELETE FROM SR10.offres WHERE offre_uid = ? AND organisations_uid = ?", [offre_uid, siren])
        return result !== undefined && result !== null && result.affectedRows === 1;
    },

    edit_offre: async function(offre_uid, siren, data) {
        if (offre_uid === undefined || data === undefined) {
            throw new Error("Missing parameters")
        }

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
            status === undefined || loc_lat === undefined
        ) {
            throw new Error("INVALID_DATA");
        }
        let city_fetch = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc_lat},${loc_long}&sensor=false&key=AIzaSyCMy-hj1vTMWe303mkUGIY9bnapDW3nsr0`)
        let addresse = city_fetch.data.results[0]['formatted_address'];
        let sql_update = 'UPDATE offres\n' +
            'SET organisations_uid = ?, status_poste = ?, intitule = ?, \n' +
            '    responsable = ?, type_metier = ?, lieu_mission_lat = ?, \n' +
            '    lieu_mission_long = ?, rythme = ?, date_validite = ?, pieces_demandes = ?, \n' +
            '    nb_piece_demandes = ?, etat_offre = ?, adresse = ?, salaire = ?\n' +
            'WHERE offre_uid = ?';
        let sql_values = [siren, status_poste, intitule, responsable, type, loc_lat, loc_long, rythme, exp_date, pieces, nb_pieces, status, addresse, salaire, offre_uid];
        let result = await db.get_pool().query(sql_update, sql_values);
        return result !== undefined && result !== null && result.affectedRows === 1;
    }
}
