create table positions_type
(
    pos_type_uid  int auto_increment
        primary key,
    pos_type_name varchar(16) null,
    constraint positions_type_name
        unique (pos_type_name)
);

INSERT INTO SR10.positions_type (pos_type_uid, pos_type_name) VALUES (3, 'ACCEPTÉE');
INSERT INTO SR10.positions_type (pos_type_uid, pos_type_name) VALUES (1, 'BROUILLON');
INSERT INTO SR10.positions_type (pos_type_uid, pos_type_name) VALUES (2, 'ENVOYÉE');
INSERT INTO SR10.positions_type (pos_type_uid, pos_type_name) VALUES (4, 'REFUSÉE');
