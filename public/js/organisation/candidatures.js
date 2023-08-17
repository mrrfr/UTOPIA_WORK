const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

function fill_datatable(filter = ''){
    let candidature_table = $('#candidatures').dataTable(
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
                { data: 'nom_candidat' },
                { data: 'prenom_candidat' },
                { data: 'mail_candidat' },
                { data: 'tel_candidat' },
                { data: 'candidature_status' },
                { data: 'candidature_status_n', bVisible: false },
                {
                    mRender: function (data, type, row) {
                        if (row['candidature_status_n'] === 2) {
                            return  '<span class="actions" "> ' +
                                '<button type="button" onclick="accept_candidature(' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">ACCEPTER LA CANDIDATURE</button>' +
                                '<button type="button" onclick="download_candidature_docs(' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">TÉLÉCHARGER LA CANDIDATURE</button>' +
                                '<button type="button" onclick="refuse_candidature(' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-danger">REFUSER LA CANDIDATURE</button>' +
                                '</span>'
                        } else {
                            return '<span class="actions" style="display: flex; align-items: center; justify-content: center; height: 25vh; margin-top: 4vh; margin-bottom: 2vh" "> ' +
                                '<i class=\'bx bxs-no-entry\'></i> <br> ' +
                                '<p>Vous ne pouvez plus modifier cette candidature</p>' +
                                '<button type="button" onclick="download_candidature_docs(' + row['candidature_uid'] +')" style="margin-bottom: 5px" class="btn btn-success">TÉLÉCHARGER LA CANDIDATURE</button>' +
                                '</span>'

                        }
                    },
                }
            ]
        }
    );
}

function filter_table(filter) {
    $('#candidatures').DataTable().destroy();
    fill_datatable(filter)
}

function edit_candidature(offre_uid, candidature_uid) {
    if (candidature_uid === undefined || offre_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }
    document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid
}

function refuse_candidature(candidature_uid) {
    if (candidature_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir refuser cette candidature?',
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
                "La candidature a été refusé avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

function accept_candidature(candidature_uid) {
    if (candidature_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Êtes-vous sûr de vouloir accepter cette candidature?',
        text: "Cette action est irréversible !",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Oui, je le veux!',
        denyButtonText: `Non, je ne le veux pas`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let start_time = Date.now()
            try {
                let result = await accept_candidature_in_db(candidature_uid)
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
                "La candidature a été accepté avec succès!",
                '',
                'success'
            ).then(() => {
                window.location.reload()
            })

        }
    })

}

function download_candidature_docs(candidature_uid) {
    if (candidature_uid === undefined) {
        window.location.href = window.location.origin + '/errors/500'
    }

    Swal.fire({
        title: 'Téléchargement en cours',
        html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la requête!</b>`,
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: async () => {
            Swal.showLoading();
            Swal.stopTimer();
            let downloadResult = await download_candidature_docs_from_db(candidature_uid);
            if (downloadResult) {
                setTimeout(async (_) => {
                    Swal.resumeTimer();
                }, 1000);
            } else {
                setTimeout(async (_) => {
                    Swal.resumeTimer();
                    setTimeout(async (_) => {
                        Swal.close();
                    }, 1000);
                }, 1000);
            }
        },
    }).then(
        result => {
            if (result.dismiss === Swal.DismissReason.timer) {
                Toast.fire({
                    icon: 'success',
                    title: 'Téléchargement réussi !'
                })
                return
            }
            Toast.fire({
                icon: 'error',
                title: 'Une erreur est survenu lors du téléchargement ...'
            })
        }
    )

}

async function delete_candidature_in_db(candidature_uid) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/candidatures/edit/" + candidature_uid,
                dataType: "json",
                encode: true,
                data: {
                    status: 4
                }
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors du rejet de la candidature")
                })
            );
        }
    )
}

async function accept_candidature_in_db(candidature_uid) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/candidatures/edit/" + candidature_uid,
                dataType: "json",
                encode: true,
                data: {
                    status: 3
                }
            }).done(function (data) {
                resolve(data)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors de l'acceptation de la candidature")
                })
            );
        }
    )
}

async function download_candidature_docs_from_db(candidature_uid) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/candidatures/download/" + candidature_uid,
                dataType: "json",
                encode: true,
            }).done(function (data) {
                for (let doc in data) {
                    let file = data[doc]
                    const a = document.createElement('a')
                    a.href = file.file_path
                    a.download = file.file_path.split('/').pop()
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                }
                resolve(true)
            }).fail(
                (function (xhr, status, error) {
                    console.log(xhr)
                    reject("Une erreur est survenue lors de l'acceptation de la candidature")
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
