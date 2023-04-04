create table offre
(
    offre_uid         int auto_increment
        primary key,
    fiche_poste_uid   int  not null,
    etat_offre        int  not null,
    date_validite     date null,
    nb_pices_demandes int  not null,
    pieces_demandes   text not null,
    constraint etat_offre_fk
        foreign key (etat_offre) references etat_offre (etat_uid),
    constraint offre_postes_uid_fk
        foreign key (fiche_poste_uid) references postes (poste_uid)
);

