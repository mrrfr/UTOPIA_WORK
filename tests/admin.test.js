const db = require("../models/database/db");
const admin_model = require("../models/admin");

describe("Admin model - Tests", () => {
    beforeAll((done) => {
        let sql_insert = "INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (1, 'ADMIN TEST', 'TEST', 'admin-test@test.test', '0123456789', 'aaaaa', '2023-06-01', 'ACTIF', 3)"
        db.execute_query(sql_insert, []).then(
            _ => {
                let sql_insert = "INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (2, 'ADMIN TEST', 'TEST', 'user-test@test.test', '0123456789', 'aaaaa', '2023-06-01', 'ACTIF', 1)"
                db.execute_query(sql_insert, []).then(
                    _ => {
                        done()
                    }
                ).catch(
                    (err) => {
                        done(err)
                    }
                );
            }
        ).catch(
            (err) => {
                done(err)
            }
        );
    });
    afterAll((done) => {
        let sql_delete = "DELETE FROM utilisateurs WHERE adresse_email = 'admin-test@test.test'"
        db.execute_query(sql_delete, []).then(
            _ => {
                let sql_delete = "DELETE FROM utilisateurs WHERE user_uid = 2"
                db.execute_query(sql_delete, []).then(
                    _ => {
                        db.get_pool().end();
                        done()
                    }
                ).catch(
                    (err) => {
                        db.get_pool().end();
                        done(err)
                    }
                );
            }
        );
        done()
    });
    test ("TEST IS ADMIN func",(done)=>{
        admin_model.is_user_admin(1).then(
            (result) => {
                expect(result).toBe(true);
                done()
            }
        ).catch(
            (err) => {
                done(err)
            }
        );
    });

    test ("DELETE USER ADMIN func",(done)=>{
        admin_model.delete_user(2).then(
            (result) => {
                expect(result).toBe(true);
                done()
            }
        ).catch(
            (err) => {
                done(err)
            }
        );
    });
})
