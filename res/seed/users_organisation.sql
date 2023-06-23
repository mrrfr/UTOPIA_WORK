create table users_organisation
(
    user_uid         int         not null,
    organisation_uid int         not null comment 'SIREN',
    user_status      varchar(40) null,
    constraint users_organisation_pk
        unique (user_uid),
    constraint users_organisation_organisations_null_fk
        foreign key (organisation_uid) references organisations (siren)
            on update cascade on delete cascade,
    constraint users_organisation_utilisateurs_null_fk
        foreign key (user_uid) references utilisateurs (user_uid)
            on update cascade on delete cascade
);

INSERT INTO SR10.users_organisation (user_uid, organisation_uid, user_status) VALUES (30, 99887766, 'ACCEPTÉE');
