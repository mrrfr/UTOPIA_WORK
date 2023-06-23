create table offres
(
    organisations_uid int         not null,
    intitule          varchar(64) not null,
    status_poste      varchar(64) null,
    offre_uid         int auto_increment
        primary key,
    responsable       varchar(64) null,
    type_metier       varchar(64) not null,
    lieu_mission_lat  varchar(64) not null,
    lieu_mission_long varchar(64) null,
    rythme            varchar(64) not null,
    date_validite     date        null,
    pieces_demandes   text        null,
    nb_piece_demandes int         null,
    etat_offre        int         not null,
    adresse           text        not null,
    salaire           int         not null,
    constraint postes_etat_offre_null_fk
        foreign key (etat_offre) references etat_offre (etat_uid),
    constraint postes_organisations_null_fk
        foreign key (organisations_uid) references organisations (siren)
            on update cascade on delete cascade
);

INSERT INTO SR10.offres (organisations_uid, intitule, status_poste, offre_uid, responsable, type_metier, lieu_mission_lat, lieu_mission_long, rythme, date_validite, pieces_demandes, nb_piece_demandes, etat_offre, adresse, salaire) VALUES (99887766, 'Ingénieur en chef', 'Cadre (CDI)', 8, 'Bruno le Maire', 'Cybérsécurité', '48.93335237076691', '2.355987523857368', '35H', '2023-06-09', 'CV + Lettre de motivation', 2, 2, '46 Rue Gabriel Péri, 93200 Saint-Denis, France', 40000);
INSERT INTO SR10.offres (organisations_uid, intitule, status_poste, offre_uid, responsable, type_metier, lieu_mission_lat, lieu_mission_long, rythme, date_validite, pieces_demandes, nb_piece_demandes, etat_offre, adresse, salaire) VALUES (99887766, 'Ingénieur en chef', 'Cadre (CDI)', 9, 'Bruno', 'Sys-administrateur', '48.961868495358324', '2.402966967863649', '40H', '2024-07-19', 'CV + Lettre de motivation', 2, 2, '3 Rue Marcel Cerdan, 95140 Garges-lès-Gonesse, France', 35000);
