const request = require("supertest");
const db = require("../models/database/db");
const app_url = "http://localhost:3000";

describe("Auth HTTP routes - Tests", () => {

    afterAll((done) => {
        let sql_delte = "DELETE FROM utilisateurs WHERE adresse_email = 'test@demo.test'"
        db.execute_query(sql_delte, []).then(
            _ => {
                db.get_pool().end();
                done()
            }
        );
    });

    test("POST /authentification/register", (done) => {
        request(app_url)
            .post(`/authentification/register`)
            .send(
                {
                    nom_de_famille: "Test",
                    prenom: "Test",
                    numero_telephone: "0123456789",
                    email: 'test@demo.test',
                    mot_de_passe: "Test12345678?.",
                    c_mot_de_passe: "Test12345678?.",
                }
            )
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });

})
