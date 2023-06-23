create table organisations_type
(
    type_uid  int auto_increment
        primary key,
    type_name varchar(32) not null,
    constraint Org_TYPE_NAME_SK
        unique (type_name)
);

INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (5, 'ASSOCIATION');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (4, 'EURL');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (3, 'SA');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (1, 'SARL');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (6, 'SAS');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (2, 'SASU');
INSERT INTO SR10.organisations_type (type_uid, type_name) VALUES (7, 'TYPE PERSO');
