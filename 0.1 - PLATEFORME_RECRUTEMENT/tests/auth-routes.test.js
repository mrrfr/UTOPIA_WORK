const request = require("supertest");
const app_url = "http://localhost:3000";

describe("Auth HTTP routes - Tests", () => {
    test("GET /authentification/inscription", (done) => {
        request(app_url)
            .get(`/authentification/inscription`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });

    test("GET /authentification/connexion", (done) => {
        request(app_url)
            .get(`/authentification/connexion`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });

})
