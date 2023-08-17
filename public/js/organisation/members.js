const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

function fill_datatable(filter = ''){
    let members_table = $('#members_table').dataTable(
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
                'url':'members',
                'data': {
                    'filter': filter
                }
            },
            'columns': [
                { data: 'user_uid', bVisible: false },
                { data: 'nom' },
                { data: 'prenom' },
                { data: 'adresse_email' },
                { data: 'tel' },
                { data: 'compte_status' },
                { data: 'user_status' },
                {
                    mRender: function (data, type, row) {
                        if (row['user_status'] === 'EN ATTENTE DE CONFIRMATION') {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="accept_org(' + row['user_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">ACCEPTER</button>' +
                                '<button type="button" onclick="refuse_org(' + row['user_uid'] +')" style="margin-bottom: 5px" class="btn btn-danger">REFUSER</button>' +
                                '</span>'
                        } else if (row['user_status'] === 'REFUSÉE') {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 5vh" "> <i class=\'bx bxs-no-entry\'></i> ' +
                                '</span>'
                        } else {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="delete_member_from_org(' + row['user_uid'] +')" style="margin-bottom: 5px" class="btn btn-danger">Supprimer de l\'organisation</button>' +
                                '</span>'
                        }
                    },
                }
            ]
        }
    );
}

function filter_table(filter) {
    $('#members_table').DataTable().destroy();
    fill_datatable(filter)
}

function accept_org(user_id) {
    if (user_id === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir accepter cet utilisateur ?',
        text: "Vous devrez supprimer l'organisation, si vous ne la voulez plus!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await confirm_org_in_db(user_id)
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
            Toast.fire({
                icon: 'success',
                title: 'L\'utilisateur a été accepté avec succès'
            }).then(
                _ => window.location.reload()
            )

        }
    })

}

async function confirm_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/members/" + siren,
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
        title: 'Êtes-vous sûr de vouloir refuser cet utilisateur?',
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
            Toast.fire({
                icon: 'success',
                title: "L'utilisateur a été refusée avec succès!",
            }).then(
                _ => window.location.reload()
            )
        }
    })

}

async function refuse_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/organisations/members/" + siren,
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

function delete_member_from_org(member_id) {
    if (member_id === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await delete_member_in_db(member_id)
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
            Toast.fire(
                {
                    icon :'success',
                    title: "L'utilisateur a été supprimé avec succès!",
                }
            ).then(() => {
                window.location.reload()
            })
        }
    })

}

async function delete_member_in_db(member_id) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/organisations/org-members/" + member_id,
                dataType: "json",
                encode: true,
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    let xhr_json = JSON.parse(xhr.responseText)
                    if (xhr_json && xhr_json.error) {
                        reject(xhr_json.error)
                    }
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
