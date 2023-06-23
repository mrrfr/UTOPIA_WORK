var markersArray = [];

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

$(document).ready(function () {
    $("#candidature_creation_form").submit(function (event) {
        event.preventDefault();
    })

    const  next_click=document.querySelectorAll(".next_button");
    var main_form=document.querySelectorAll(".main");
    var step_list = document.querySelectorAll(".progress-bar li");
    var num = document.querySelector(".step-number");
    let formnumber=0;

    next_click.forEach(function(next_click_form){
        next_click_form.addEventListener('click',function(){
            if(!validateform()){
                return false
            }
            formnumber++;
            updateform();
            progress_forward();
            contentchange();
        });
    });

    var back_click=document.querySelectorAll(".back_button");
    back_click.forEach(function(back_click_form){
        back_click_form.addEventListener('click',function(){
            formnumber--;
            updateform();
            progress_backward();
            contentchange();
        });
    });

    if(document.location.search !== " " && document.location.search !== "") {
        let lookingFor = document.location.search.split("=")[1] - 1;
        for (let i =0; i<=lookingFor; i++) {
            formnumber++
            updateform();
            progress_forward();
        }

    }

    var username=document.querySelector("#user_name");
    var shownname=document.querySelector(".shown_name");

    async function submit_upload_form(data, offre_uid, candidature_uid) {
        return new Promise(
            async (resolve) => {
                 $.ajax({
                     url: document.location.pathname.includes("edition") ? `/organisations/offers/edition/${data.offre_uid}` : `${candidature_uid}/upload`,
                     type: "POST",
                     data: data,
                     success: function (data) {
                         resolve(true);
                     },
                     error: function (err) {
                         resolve(false);
                     }
                 });
            }
        )
    }

    const upload_btn = document.querySelectorAll(".upload_btn");

    upload_btn.forEach(function(upload_btn_el){
        upload_btn_el.addEventListener('click',function(){
            if(!validateform()){
                return false
            }
            Swal.fire({
                title: 'Voulez-vous envoyer ce document?',
                text: "L'organisation ne verra ce document que vous lorsque vous aurez confirmé votre candidature!",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Oui, je veux publier!',
                denyButtonText: `Non, je ne veux pas`,
            }).then((result) => {
                if (result.isConfirmed || result.isDenied) {
                    const offre_uid = $("#offre_uid").val();
                    const candidature_uid = $("#candidature_uid").val();

                    const myFiles = document.getElementById('file_to_upload').files
                    const formData = new FormData()

                    Object.keys(myFiles).forEach(key => {
                        formData.append(myFiles.item(key).name, myFiles.item(key))
                    })

                    Swal.fire({
                        title: 'Publication en cours',
                        html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la requête!</b>`,
                        timer: 2000,
                        timerProgressBar: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        didOpen: async () => {
                            Swal.showLoading();
                            Swal.stopTimer();


                            const response = await fetch(`http://localhost:3000/offres/candidature/${offre_uid}/${candidature_uid}/upload`, {
                                method: 'POST',
                                body: formData
                            })

                            const json = await response.json()
                            if (json.status === "success") {
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
                            Toast.fire({
                                icon: 'success',
                                title: "Le téléversement s'est effectué avec succès!",
                                text: "Rechargement de la page en cours..."
                            }).then(
                                (_) => document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid + "?step=3"
                            )
                        }
                        if(result.dismiss === Swal.DismissReason.dismiss) {
                            Toast.fire({
                                icon: 'error',
                                title: "Erreur lors du téléversement !",
                                text: "Veuillez ré-essayez plus tard!"
                            }).then(
                                (_) => document.location.reload()
                            )
                        }
                    });
                }
            })
        });
    });

    function post_candidature_to_db() {
        return new Promise(
            (resolve) => {
                const candidature_uid = $("#candidature_uid").val();
                console.log(candidature_uid)
                $.ajax({
                    url: `http://localhost:3000/offres/candidature/${candidature_uid}/publier`,
                    type: "POST",
                    data: {},
                    success: function (data) {
                        resolve(true);
                    },
                    error: function (err) {
                        resolve(false);
                    }
                });
            }
        )
    }


    const submit_click = document.querySelectorAll("#submit_candidature_button");
    submit_click.forEach(function(submit_click_form){
        submit_click_form.addEventListener('click',function(){
            Swal.fire({
                title: 'Voulez-vous publier cette candidature là?',
                text: "Si vous refusez, la candidature se sauvegardera en mode brouillon!",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Oui, je veux publier!',
                denyButtonText: `Non, je veux garder la candidature en brouillon`,
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Publication en cours',
                        html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la requête!</b>`,
                        timer: 2000,
                        timerProgressBar: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        didOpen: async () => {
                            Swal.showLoading();
                            Swal.stopTimer();
                            let post_result = await post_candidature_to_db();
                            if (post_result) {
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
                            Toast.fire({
                                icon: 'success',
                                title: "L'envoi a été effectué avec succès!",
                                text: "Rechargement de la page en cours..."
                            }).then(
                                (_) => {
                                    document.location.href = window.location.origin + '/offres/mes-candidatures/'
                                }
                            )
                        }
                        if(result.dismiss === Swal.DismissReason.dismiss) {
                            Toast.fire({
                                icon: 'error',
                                title: "Une erreur est survenu lors de l'envoi!",
                                text: "Rechargement de la page en cours..."
                            }).then(
                                (_) => {
                                    let offre_uid = $("#offre_uid").val();
                                    let candidature_uid = $("#candidature_uid").val();
                                    document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid + "?step=3"
                                }
                            )
                        }
                    });
                }
            })
        });
    });



    function updateform(){
        main_form.forEach(function(mainform_number){
            mainform_number.classList.remove('active');
        })
        main_form[formnumber].classList.add('active');
    }

    function progress_forward(){
        num.innerHTML = formnumber+1;
        step_list[formnumber].classList.add('active');
    }

    function progress_backward(){
        var form_num = formnumber+1;
        step_list[form_num].classList.remove('active');
        num.innerHTML = form_num;
    }

    var step_num_content=document.querySelectorAll(".step-number-content");

    function contentchange(){
        step_num_content.forEach(function(content){
            content.classList.remove('active');
            content.classList.add('d-none');
        });
        step_num_content[formnumber].classList.add('active');
    }


    function validateform(){
        validate=true;
        var validate_inputs=document.querySelectorAll(".main.active input");
        validate_inputs.forEach(function(vaildate_input){
            vaildate_input.classList.remove('warning');
            if(vaildate_input.hasAttribute('require')){
                if(vaildate_input.value.length==0){
                    validate=false;
                    vaildate_input.classList.add('warning');
                }
            }
        });
        return validate;

    }

    function clearOverlays() {
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }

    function update_loc_inputs(lat, long) {
        $("#loc_lat").val(lat);
        $("#loc_long").val(long);
    }

    let map;

    async function initMap() {
        // The location of Paris
        //const position = { lat: 48.853684, lng: 2.349220 };
        const position = { lat: parseFloat($("#loc_lat").val()), lng: parseFloat($("#loc_long").val()) };
        console.log(position);
        // Request needed libraries.
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        map = new Map(document.getElementById("map"), {
            zoom: 10,
            center: position,
            mapId: "SR10_MAP",
        });

        // The marker, positioned at Uluru
        const marker = new AdvancedMarkerElement({
            map: map,
            position: position,
            title: "Localisation de la mission",
        });

        update_loc_inputs(position["lat"], position["lng"]);

        markersArray.push(marker);
    }

    initMap();

})

function delete_file(file_uid) {
    Swal.fire({
        title: 'Publication en cours',
        html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la requête!</b>`,
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: async () => {
            Swal.showLoading();
            Swal.stopTimer();
            let post_result = await delete_file_in_db(file_uid);
            if (post_result) {
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
            Toast.fire({
                icon: 'success',
                title: "La suppression a été effectué avec succès!",
                text: "Rechargement de la page en cours..."
            }).then(
                (_) => document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid + "?step=3"
            )
        }
        if(result.dismiss === Swal.DismissReason.dismiss) {
            Toast.fire({
                icon: 'error',
                title: "Une erreur est survenu lors de la suppression!",
                text: "Veuillez réessayez plus tard, Rechargement de la page en cours..."
            }).then(
                (_) => document.location.href = window.location.origin + '/offres/candidature/' + offre_uid + '/' + candidature_uid + "?step=3"
            )
        }
    });
}

function delete_file_in_db(file_uid) {
    return new Promise(
        (resolve) => {
            const offre_uid = $("#offre_uid").val();
            const candidature_uid = $("#candidature_uid").val();
            $.ajax({
                url: `http://localhost:3000/offres/candidature/${offre_uid}/${candidature_uid}/delete/${file_uid}`,
                type: "DELETE",
                data: {},
                success: function (data) {
                    resolve(true);
                },
                error: function (err) {
                    resolve(false);
                }
            });
        }
    )
}
