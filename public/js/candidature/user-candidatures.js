function fill_datatable(filter = ''){
    let users_candidatures = $('#user_candidatures').dataTable(
        {
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.10.21/i18n/French.json"
            },
            "aLengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
            "iDisplayLength": 10,
            'processing': true,
            'serverSide': true,
            'serverMethod': 'post',
            'ajax': {
                'url':'',
                'data': {
                    'filter': filter
                }
            },
            'columns': [
                { data: 'candidature_uid', bVisible: false },
                { data: 'offre_uid', bVisible: false },
                { data: 'nom_org' },
                { data: 'intitule' },
                { data: 'type' },
                { data: 'adresse' },
                { data: 'salaire' },
                { data: 'rythme' },
                { data: 'candidature_status' },
                { data: 'candidature_status_n', bVisible: false },
                {
                    mRender: function (data, type, row) {
                        if (row['candidature_status_n'] === 1) {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="edit_candidature(' +row['offre_uid'] + ',' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">ÉDITER MA CANDIDATURE</button>' +
                                '<button type="button" onclick="delete_candidature(' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-danger">SUPPRIMER MA CANDIDATURE</button>' +
                                '</span>'
                        } else if (row['candidature_status_n'] === 2) {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 25vh; margin-top: 4vh; margin-bottom: 2vh" "> ' +
                                '<i class=\'bx bxs-no-entry\'></i> <br> ' +
                                '<p>Vous ne pouvez plus modifier votre candidature</p>' +
                                '<button type="button" onclick="delete_candidature(' + row['candidature_uid'] +')" style=" margin-top: 10px" class="btn btn-danger">SUPPRIMER MA CANDIDATURE</button>' +
                                '</span>'

                        } else {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 25vh; margin-top: 4vh; margin-bottom: 2vh" "> ' +
                                '<i class=\'bx bxs-no-entry\'></i> <br> ' +
                                '<p>Vous ne pouvez plus modifier votre candidature</p>' +
                                '</span>'
                        }
                    },
                }
            ]
        }
    );
}

function filter_table(filter) {
    $('#user_candidatures').DataTable().destroy();
    fill_datatable(filter)
}

function edit_candidature(offre_uid, candidature_uid) {
    if (candidature_uid === undefined || offre_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }
    document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid
}

function delete_candidature(candidature_uid) {
    if (candidature_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cette candidature?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await delete_candidature_in_db(candidature_uid)
                console.log(result)
                if (!result) {
                    Swal.showValidationMessage(
                        `La requête a échoué`
                    )
                    return
                }
            } catch (err) {
                console.log(err)
                Swal.showValidationMessage(
                    `La requête a échoué : ${err}`
                )
                return
            }
            let end_time = Date.now()
            if (end_time - start_time < 2500) {
                await sleep(2500 - (end_time - start_time))
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                "La candidature a été supprimée avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

async function delete_candidature_in_db(candidature_uid) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/offres/candidature/" + candidature_uid + "/supprimer",
                dataType: "json",
                encode: true,
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors de la suppression de l'utilisateur")
                })
            );
        }
    )
}

async function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

$(document).ready(function(){
    fill_datatable()
});
