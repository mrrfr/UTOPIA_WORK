create table candidature
(
    candidature_uid    int auto_increment
        primary key,
    candidature_date   date not null,
    candidat_uid       int  not null,
    candidature_status int  not null,
    candidature_offre  int  null,
    constraint candidate_fk
        foreign key (candidat_uid) references utilisateurs (user_uid)
            on update cascade on delete cascade,
    constraint candidature_positions_type_null_fk
        foreign key (candidature_status) references positions_type (pos_type_uid)
);

create index candidature_offres_null_fk
    on candidature (candidature_offre);

INSERT INTO SR10.candidature (candidature_uid, candidature_date, candidat_uid, candidature_status, candidature_offre) VALUES (11, '2023-06-21', 32, 3, 8);
INSERT INTO SR10.candidature (candidature_uid, candidature_date, candidat_uid, candidature_status, candidature_offre) VALUES (22, '2023-06-23', 31, 3, 9);
INSERT INTO SR10.candidature (candidature_uid, candidature_date, candidat_uid, candidature_status, candidature_offre) VALUES (23, '2023-06-23', 57, 4, 9);
