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


$(document).ready(function(){
    $('#users_table').dataTable(
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
                'url':'users'
            },
            'columns': [
                { data: 'user_uid', bVisible: false },
                { data: 'nom' },
                { data: 'prenom' },
                { data: 'adresse_email' },
                { data: 'tel' },
                { data: 'user_group_uid' },
                { data: 'date_creation' },
                { data: 'compte_status' },
                {
                    mRender: function (data, type, row) {
                        let nom = row["nom"]
                        let prenom = row["prenom"]
                        let adresse_email = row["adresse_email"]
                        let tel = row["tel"]
                        let user_group_uid = row["user_group_uid"]
                        return  '<span class="actions" "> ' +
                                    '<button type="button" onclick= "edit_user(' + row[`user_uid`] +', \'' + nom +'\', \'' + prenom +'\', \'' + adresse_email  +'\', \'' + tel +' \', \'' + row[`user_group_uid`]  +'\')" style="margin-bottom: 5px" class="btn btn-primary">Éditer</button>' +
                                    '<button type="button" onclick= "delete_user(' + row[`user_uid`] +')" style="margin-bottom: 5px" class="btn btn-danger">Supprimer</button>' +
                                '</span>'
                    },
                }
            ]
    }
    );
});

async function edit_user(id, nom, prenom, email, tel, role) {
    if (id === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    let role_selection_disabled = false
    if (role === "ADMINISTRATEUR") {
        role = 3
    } else if (role === "UTILISATEUR") {
        role = 1
    } else {
        role = 2
        role_selection_disabled = true
    }

    Swal.fire({
        title: 'Multiple inputs',
        html:
            `<input id="nom_famille" required class="swal2-input" value="${nom}"> <br>` +
            '<label for="nom_famille">Nom de famille</label><br>\n' +
            `<input id="prenom" required class="swal2-input" value="${prenom}"> <br>` +
            '<label for="prenom" >Prénom(s)</label><br>\n' +
            `<input id="adresse_email" required class="swal2-input" value="${email}"> <br>` +
            '<label for="adresse_email">Adresse e-mail</label><br>\n' +
            `<input id="tel" required class="swal2-input" value="${tel}"> <br>` +
            '<label for="tel">N° de téléphone</label><br> <br>\n' +
            '<label for="role">Rôle sur la plateforme</label><br>\n' +
            '<select id="role" required class="swal2-input" ' + (role_selection_disabled ? 'disabled' : '') + '>' +
                '<option value="1" ' + (role === 1 ? 'selected' : '') + '>Utilisateur</option>' +
                '<option value="2" ' + (role === 2 ? 'selected' : '') + '>Recruteur</option>' +
                '<option value="3" ' + (role === 3 ? 'selected' : '') + '>Administrateur</option>' +
            '</select>',
            focusConfirm: false,
            showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            let values = {
                nom_famille: document.getElementById('nom_famille').value,
                prenom: document.getElementById('prenom').value,
                adresse_email: document.getElementById('adresse_email').value,
                tel: document.getElementById('tel').value,
                role: parseInt(document.getElementById('role').value, 10)
            }
            try {
                let result = await edit_user_in_db(id, values)
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
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        if (result.isConfirmed) {
            Toast.fire({
                icon: 'success',
                title: "L'utilisateur a été édité avec succès!",
                text: "Mise à jour de la page en cours..."
            }).then(
                _ => document.location.reload()
            )
            /*Swal.fire(
                "L'utilisateur a été édité avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })*/

        }
    })

}

function delete_user(id) {
    if (id === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer cet utilisateur?',
        text: "Vous ne pourrez pas revenir en arrière!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await delete_user_from_db(id)
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
            Toast.fire({
                icon: 'success',
                title: "L'utilisateur a été supprimé avec succès!",
                text: "Mise à jour de la page en cours..."
            }).then(
                _ => document.location.reload()
            )
        }
    })

}

async function delete_user_from_db(user_id) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "DELETE",
                url: "http://localhost:3000/administration/users/" + user_id,
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

async function edit_user_in_db(user_id, data) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/administration/users/" + user_id,
                data: data,
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

