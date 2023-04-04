create table organisations
(
    siren             int(9)      not null
        primary key,
    nom               varchar(50) not null,
    organisation_type int         not null,
    siege             varchar(50) null comment 'N° Rue (4 CAR. MAX) + ADRESSE RUE (38. CAR MAX) + CODE POSTAL (5 CAR. MAX) + 3 CAR USAGEFUTURES',
    constraint organisations_type_fk
        foreign key (organisation_type) references organisations_type (type_uid)
);

