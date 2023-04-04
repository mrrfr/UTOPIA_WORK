create table organisations_type
(
    type_uid  int auto_increment
        primary key,
    type_name varchar(32) not null,
    constraint Org_TYPE_NAME_SK
        unique (type_name)
);

