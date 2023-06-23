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

$(document).ready(function () {
    $("form").submit(function (event) {

        let formData = {
            nom_organisation: $("#nom").val(),
            type_organisation: parseInt($("#type").val(), 10),
            siege: $("#siege").val(),
            siren: $("#siren").val(),
        };


        Swal.fire({
            title: "Création de l'organisation en cours...",
            html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la requête!</b>`,
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: async () => {
                Swal.showLoading();
                Swal.stopTimer();
                let creationResult = await create_organisataion(formData);
                console.log(creationResult)
                if (creationResult) {
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
        }).then((result) => {
            console.log(result)
            if (result.dismiss === Swal.DismissReason.timer) {
                Swal.fire({
                    icon: 'success',
                    title: "Succès !",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                }).then(
                    (_) => {
                        document.location.reload();
                    }
                )
            }
            if(result.dismiss === Swal.DismissReason.dismiss) {
                Swal.fire({
                    icon: 'error',
                    title: "Erreur lors de la requête !",
                    text: "Veuillez ré-essayez plus tard!"
                }).then(_ => {
                    Swal.close();
                    document.location.reload();
                })
            }
        });

        event.preventDefault();
    });
});

async function create_organisataion(data) {
    return new Promise(
        (resolve) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/creation",
                data: data,
                dataType: "json",
                encode: true,
            }).done(function (data) {
                console.log(data);
                resolve(true)
            }).fail(
                (function (xhr, status, error) {
                    resolve(false)
                })
            );
        }
    )
}

function join_organisation() {
    Swal.fire({
        title: "Rejoindre une organisation existante",
        text: "Entrez le SIREN ou le RNA de l'organisation que vous voulez rejoindre!",
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Rejoindre',
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        preConfirm: async (siren) => {
            try {
                let start_time = Date.now()
                await join_org_in_db(siren);

                let end_time = Date.now()
                if (end_time - start_time < 2500) {
                    await sleep(2500 - (end_time - start_time))
                }
            } catch (error) {
                console.log(error)
                Swal.showValidationMessage(
                    `La requête a échoué : ${error}`
                )
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                "Adhésion à une organisation existante !",
                "Votre demande a été envoyé aux gestionnaires de l'organisation !",
                'success'
            ).then(() => {
                window.location.reload()
            })
        }
    })
}

async function join_org_in_db(siren) {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/adhesion/",
                dataType: "json",
                data: {
                    siren: siren
                },
                encode: true,
            }).done(function (data) {
                resolve(data.result)
            }).fail(
                (function (xhr, status, error) {
                    reject("Une erreur est survenue lors de la suppression de l'utilisateur")
                })
            );
        }
    )
}

function restart_org() {
    Swal.fire({
        title: "Êtes-vous sûr de vouloir recommencer le processus d'adhésion ?",
        text: "Si vous recommencez le processus d'adhésion, vous perdrez toutes les données saisies précédemment !",
        showCancelButton: true,
        confirmButtonText: 'Oui, je veux recommencer',
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            try {
                let start_time = Date.now()
                await restart_org_in_db();
                let end_time = Date.now()
                if (end_time - start_time < 2500) {
                    await sleep(2500 - (end_time - start_time))
                }
            } catch (error) {
                console.log(error)
                Swal.showValidationMessage(
                    `La requête a échoué : ${error}`
                )
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            Toast.fire({
                icon: 'success',
                title: 'Processus d\'adhésion recommencé !'
            }).then(() => {
                window.location.reload()
            })
        }
    })
}

async function restart_org_in_db() {
    return new Promise(
        (resolve, reject) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/organisations/restart/",
                dataType: "json",
                encode: true,
            }).done(function (data) {
                resolve(data.result)
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
