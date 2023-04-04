create table utilisateurs
(
    usersUid     int                    not null
        primary key,
    nom          varchar(32)            not null,
    prenom       varchar(32)            not null,
    tel          varchar(10)            not null,
    dateCreation date default curdate() not null,
    compteStatus tinyint(1) as (1),
    user_group   int                    null,
    constraint utilisateurs_group_fk
        foreign key (user_group) references `groups` (groupsUid)
);

