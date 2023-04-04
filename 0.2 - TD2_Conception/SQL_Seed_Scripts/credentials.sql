create table credentials
(
    user_uid      int         null,
    password_hash varchar(64) not null,
    constraint credentials_user_uid_fk
        unique (user_uid),
    constraint userUid_fk_1
        foreign key (user_uid) references utilisateurs (usersUid)
            on delete set null
);

