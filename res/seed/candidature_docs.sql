create table candidature_docs
(
    candidature_uid int  not null,
    doc_uid         int auto_increment
        primary key,
    file_name       text not null,
    file_path       text not null,
    user_uid        int  not null,
    constraint candidature_docs_utilisateurs_null_fk
        foreign key (user_uid) references utilisateurs (user_uid)
            on update cascade on delete cascade
);

create index candidature_docs_candidature_null_fk
    on candidature_docs (candidature_uid);

INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (11, 25, 'Capture dâeÌcran 2023-06-21 aÌ 14.19.47.png', '/files/f2f57102-1d0f-43de-81e4-e58f22904443.png', 32);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (11, 26, 'Capture dâeÌcran 2023-06-21 aÌ 14.19.47.png', '/files/c0e47b37-54d6-4f3f-a70a-e99ffbb1c2ac.png', 32);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (12, 27, 'Capture dâeÌcran 2023-06-22 aÌ 00.54.40.png', '/files/c13c0a58-0c7a-43b0-b490-d312f5c07b18.png', 57);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (12, 28, 'Capture dâeÌcran 2023-06-22 aÌ 00.54.40.png', '/files/46b1b3b4-fefb-464f-9bb2-868917a8ec42.png', 57);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (22, 29, '46b1b3b4-fefb-464f-9bb2-868917a8ec42.png', '/files/a08e617f-02d9-454e-8828-83ad9f09a6a9.png', 31);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (22, 30, '46b1b3b4-fefb-464f-9bb2-868917a8ec42.png', '/files/57ec0f20-6702-42e7-b9f4-1b1b5957a41e.png', 31);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (23, 31, 'c13c0a58-0c7a-43b0-b490-d312f5c07b18.png', '/files/42a6e3c8-3d96-447c-877e-ee005303a2eb.png', 57);
INSERT INTO SR10.candidature_docs (candidature_uid, doc_uid, file_name, file_path, user_uid) VALUES (23, 32, '46b1b3b4-fefb-464f-9bb2-868917a8ec42.png', '/files/fb4540fd-f829-470c-90b6-078a8c85de52.png', 57);
