function fill_datatable(filter = ''){
    var org_table = $('#organisations_table').dataTable(
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
                'url':'organisations',
                'data': {
                    'filter': filter
                }
            },
            'columns': [
                { data: 'siren' },
                { data: 'nom' },
                { data: 'type' },
                { data: 'adresse_siege' },
                { data: 'status' },
                {
                    mRender: function (data, type, row) {
                        if (row['status'] === 'EN ATTENTE DE CONFIRMATION') {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="accept_org(' + row['siren'] +')" style="margin-bottom: 5px" class="btn btn-success">ACCEPTER</button>' +
                                '<button type="button" onclick="refuse_org(' + row['siren'] +')" style="margin-bottom: 5px" class="btn btn-danger">REFUSER</button>' +
                                '</span>'
                        } else if (row['status'] === 'REFUSÉE') {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 5vh" "> <i class=\'bx bxs-no-entry\'></i> ' +
                                '</span>'
                        } else {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="delete_org(' + row['siren'] +')" style="margin-bottom: 5px" class="btn btn-danger">Supprimer</button>' +
                                '</span>'
                        }
                    },
                }
            ]
        }
    );
}

function filter_table(filter) {
    $('#organisations_table').DataTable().destroy();
    fill_datatable(filter)
}

function accept_org(siren) {
    if (siren === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir accepter cette organisation?',
        text: "Vous devrez supprimer l'organisation, si vous ne la voulez plus!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await confirm_org_in_db(siren)
                if (!result.result) {
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
                "L'organisation a été accepté avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

async function confirm_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/administration/organisations/" + siren,
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

function refuse_org(siren) {
    if (siren === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir accepter cette organisation?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await refuse_org_in_db(siren)
                if (!result.result) {
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
                "L'organisation a été refusée avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

async function refuse_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/administration/organisations/" + siren,
                dataType: "json",
                encode: true,
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors de la réfutation de la demande")
                })
            );
        }
    )
}

function delete_org(siren) {
    if (siren === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cette organisation?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await delete_org_in_db(siren)
                if (!result.result) {
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
                "L'organisation a été supprimé avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

async function delete_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/administration/organisations/" + siren + "/suppression",
                dataType: "json",
                encode: true,
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors de la suppression de l'organisation")
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
