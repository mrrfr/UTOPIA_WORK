create table postes
(
    organisations_uid int         not null,
    intitule          varchar(64) not null,
    status_poste      varchar(64) null,
    poste_uid         int         not null
        primary key,
    column_name       int         null,
    responsable       varchar(64) null,
    type_metier       varchar(64) not null,
    lieu_mission      varchar(64) not null,
    rythme            varchar(64) not null,
    constraint postes_organisations_null_fk
        foreign key (organisations_uid) references organisations (siren)
);

