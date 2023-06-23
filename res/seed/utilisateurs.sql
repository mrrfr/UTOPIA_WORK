create table utilisateurs
(
    user_uid       int auto_increment comment 'USER UNIQUE ID'
        primary key,
    nom            varchar(32)  not null,
    prenom         varchar(32)  not null,
    adresse_email  varchar(100) not null,
    tel            varchar(12)  not null,
    mot_de_passe   varchar(32)  not null,
    date_creation  date         not null,
    compte_status  varchar(7)   not null,
    user_group_uid int          not null,
    constraint utilisateurs_email
        unique (adresse_email),
    constraint utilisateurs_groups_null_fk
        foreign key (user_group_uid) references `groups` (group_uid)
);

INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (29, 'ADMIN', 'ADMIN', 'admin@demo.fr', '0606060606 ', 'c540fc292080d21c746f6453a5502409', '2023-06-21', 'ACTIF', 3);
INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (30, 'Recruteur', 'Recruteur', 'recruteur@demo.fr', '0606060606', 'c540fc292080d21c746f6453a5502409', '2023-06-21', 'ACTIF', 2);
INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (31, 'user', 'Test', 'user@demo.fr', '0606060606', 'c540fc292080d21c746f6453a5502409', '2023-06-21', 'ACTIF', 1);
INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (32, 'Test', 'Test', 'utilisateur@demo.fr', '0606060606', 'c540fc292080d21c746f6453a5502409', '2023-06-21', 'ACTIF', 1);
INSERT INTO SR10.utilisateurs (user_uid, nom, prenom, adresse_email, tel, mot_de_passe, date_creation, compte_status, user_group_uid) VALUES (57, 'Test', 'Test', 'test99@demo.fr', '0606060606 ', 'c540fc292080d21c746f6453a5502409', '2023-06-23', 'ACTIF', 3);
