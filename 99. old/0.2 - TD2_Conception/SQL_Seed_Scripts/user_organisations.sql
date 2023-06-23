create table user_organisations
(
    user_uid            int null,
    organisations_siren int null,
    constraint user_organisations_fk
        foreign key (organisations_siren) references organisations (siren),
    constraint user_uid_organisations_fk
        foreign key (user_uid) references utilisateurs (usersUid)
);

