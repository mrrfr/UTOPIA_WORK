create table `groups`
(
    group_uid  int auto_increment
        primary key,
    group_name varchar(20) null
);

INSERT INTO SR10.`groups` (group_uid, group_name) VALUES (1, 'UTILISATEUR');
INSERT INTO SR10.`groups` (group_uid, group_name) VALUES (2, 'RECRUTEUR');
INSERT INTO SR10.`groups` (group_uid, group_name) VALUES (3, 'ADMINISTRATEUR');
