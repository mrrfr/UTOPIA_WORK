create table positions_type
(
    pos_type_uid  int auto_increment
        primary key,
    pos_type_name varchar(16) null,
    constraint positions_type_name
        unique (pos_type_name)
);

