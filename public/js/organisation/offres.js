function fill_datatable(filter = ''){
    var offers_table = $('#offers_table').dataTable(
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
                'url':'offers',
                'data': {
                    'filter': filter
                }
            },
            'columns': [
                { data: 'offre_uid', bVisible: false },
                { data: 'intitule' },
                { data: 'salaire' },
                { data: 'responsable' },
                { data: 'rythme' },
                { data: 'date_validite' },
                { data: 'type_metier' },
                { data: 'lat_long' },
                { data: 'etat_offre' },
                {
                    mRender: function (data, type, row) {
                        return  '<span class="actions" "> ' +
                            '<button type="button" onclick="edit_offre(' + row['offre_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">Éditer</button>' +
                            '<button type="button" onclick="delete_offre(' + row['offre_uid'] +')" style="margin-bottom: 5px" class="btn btn-danger">Supprimer</button>' +
                            '</span>'
                    },
                }
            ]
        }
    );
}

function filter_table(filter) {
    $('#offers_table').DataTable().destroy();
    fill_datatable(filter)
}

function edit_offre(offre_uid) {
    window.location.href += '/edition/' + offre_uid
}

function delete_offre(offre_uid) {
    if (offre_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cette offre?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await delete_offre_in_db(offre_uid)
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
                "L'offre a été supprimée avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

async function delete_offre_in_db(offre_uid) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/organisations/offers/" + offre_uid,
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
    fill_datatable();
});
