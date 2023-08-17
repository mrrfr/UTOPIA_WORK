function fill_datatable(filter = '', salaire = '', distance = '', localisation = '', expirer = false){
    const offers_table = $('#offers_table').dataTable(
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
                    'filter': filter,
                    'salaire': salaire,
                    'distance': distance,
                    'localisation': localisation,
                    'expirer': expirer
                }
            },
            'columns': [
                { data: 'offre_uid', bVisible: false },
                { data: 'expiree', bVisible: false },
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
                        let user_grp = $("#user_group").val()

                        if (isNaN(parseInt(user_grp, 10))) {
                            window.location.reload()
                        }

                        user_grp = parseInt(user_grp, 10)

                        if (user_grp === 1 && !row['expiree']) {
                            console.log(row['offre_uid'])
                            return  '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 15vh" "> ' +
                                '<button type="button" onclick="redirect_to_candidature(' + row['offre_uid'] + ')" style="margin-bottom: 5px" class="btn btn-success">Candidater</button> </span>'
                        } else {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 8vh; margin-top: 4vh; margin-bottom: 2vh" "> ' +
                                '<i class=\'bx bxs-no-entry\'></i> <br> ' +
                                '<p>Vous ne pouvez pas candidater</p>' +
                                '</span>'
                        }
                    },
                }
            ]
        }
    );
}

function filter_table(filter, salaire, distance, localisation, expirer) {
    $('#offers_table').DataTable().destroy();
    fill_datatable(filter, salaire, distance, localisation, expirer);
}

function redirect_to_candidature(candid_uid) {
    console.log("candid_uid")
    console.log(candid_uid)
    window.location.href += 'candidature/' + candid_uid
}

function salaire_filter() {
    Swal.fire({
        title: 'Quel salaire voulez-vous?',
        icon: 'question',
        input: 'range',
        inputLabel: 'Salaire annuel minimale requis (en €)',
        inputAttributes: {
            min: 15000,
            max: 150000,
            step: 100
        },
        inputValue: 25000
    }).then(
        value => {
            filter_table('', value.value, '', '', false)
        }
    )
}

function distance_filter() {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

successCallback = (position) => {
    Swal.fire({
        title: 'Sélectionner la distance voulez-vous?',
        icon: 'question',
        input: 'range',
        inputLabel: 'Distance maximale que vous êtes prêt à parcourir (en KM)',
        inputAttributes: {
            min: 1,
            max: 100,
            step: 1
        },
        inputValue: 25
    }).then(
        value => {
            filter_table('', '', value.value, {lat: position.coords.latitude, long: position.coords.longitude}, false)
        }
    )
}

errorCallback = (error) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'error',
        title: "Erreur",
        text: "Vous devez activer la géolocalisation pour utiliser ce filtre"
    })

    console.log(error)
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
