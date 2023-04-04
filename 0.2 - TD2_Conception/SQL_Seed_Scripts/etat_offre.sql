create table etat_offre
(
    etat_uid  int auto_increment
        primary key,
    etat_name varchar(20) not null
);

INSERT INTO sr10.etat_offre (etat_uid, etat_name) VALUES (1, 'NON PUBLIÉE');
INSERT INTO sr10.etat_offre (etat_uid, etat_name) VALUES (2, 'PUBLIÉE');
INSERT INTO sr10.etat_offre (etat_uid, etat_name) VALUES (3, 'EXPIRÉE');
