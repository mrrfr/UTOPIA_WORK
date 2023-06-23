create table organisations
(
    siren             int         not null
        primary key,
    nom               varchar(50) not null,
    organisation_type int         not null,
    siege             varchar(50) null comment 'N° Rue (4 CAR. MAX) + ADRESSE RUE (38. CAR MAX) + CODE POSTAL (5 CAR. MAX) + 3 CAR USAGEFUTURES',
    status            varchar(50) null,
    constraint organisations_type_fk
        foreign key (organisation_type) references organisations_type (type_uid)
);

INSERT INTO SR10.organisations (siren, nom, organisation_type, siege, status) VALUES (12345678, 'BDE UTC', 5, '1 Rue Roger couttloenc, 60200 Compiègne.', 'REFUSÉE');
INSERT INTO SR10.organisations (siren, nom, organisation_type, siege, status) VALUES (99887766, 'Apple Inc.', 1, '1 Place du Trocadéro, 75016 Paris.', 'ACCEPTÉE');
