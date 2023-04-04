create table candidature
(
    candidature_uid    int auto_increment
        primary key,
    candidature_date   int not null,
    candidat_uid       int not null,
    organisations      int not null,
    candidature_status int not null,
    constraint candidate_fk
        foreign key (candidat_uid) references utilisateurs (usersUid),
    constraint candidature_org_fk
        foreign key (organisations) references organisations (siren),
    constraint candidature_positions_type_null_fk
        foreign key (candidature_status) references positions_type (pos_type_uid)
);

