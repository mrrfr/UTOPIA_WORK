let markersArray = [];

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
    $("#offre_creation_form").submit(function (event) {
        event.preventDefault();
    })

    const next_click=document.querySelectorAll(".next_button");
    let main_form=document.querySelectorAll(".main");
    let step_list = document.querySelectorAll(".progress-bar li");
    let num = document.querySelector(".step-number");
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

            document.getElementById("offre_creation_form").addEventListener("submit", function (e) {
                e.preventDefault();
                var formData = new FormData(e.target);
                console.log(Object.fromEntries(formData));
            });

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

    let username=document.querySelector("#user_name");
    let shownname=document.querySelector(".shown_name");

    async function submit_form(data) {
        return new Promise(
            (resolve) => {
                $.ajax({
                    url: document.location.pathname.includes("edition") ? `/organisations/offers/edition/${data.offre_uid}` : "creation",
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


    let submit_click = document.querySelectorAll(".submit_button");
    submit_click.forEach(function(submit_click_form){
        submit_click_form.addEventListener('click',function(){
            if(!validateform()){
                return false
            }
            console.log("-------------------");
            document.getElementById("offre_creation_form").addEventListener("submit", function (e) {
                e.preventDefault();
                var formData = new FormData(e.target);
                console.log(Object.fromEntries(formData));
            });
            console.log("-------------------");
            Swal.fire({
                title: 'Voulez-vous publiée cette offre?',
                text: "Si vous refusez, l'offre ne sera publiée jusqu'à édition!",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Oui, je veux publier!',
                denyButtonText: `Non, je veux l'offre en brouillon`,
            }).then((result) => {
                if (result.isConfirmed || result.isDenied) {
                    let formData = {
                        intitule: $("#intitule").val(),
                        status_poste: $("#status_poste").val(),
                        type: $("#type").val(),
                        rythme: $("#rythme").val(),
                        loc_lat: $("#loc_lat").val(),
                        loc_long: $("#loc_long").val(),
                        responsable: $("#responsable").val(),
                        piece: $("#piece").val(),
                        date: $("#date").val(),
                        nb_pieces: $("#nb_pieces").val(),
                        salaire: $("#salaire").val(),
                    };

                    if(isNaN(parseInt(formData.salaire.trim().replaceAll(" ", ''), 10))) {
                        Swal.fire({
                            icon: 'error',
                            title: "Erreur dans les données !",
                            text: "Le salaire doit être un entier!"
                        }).then(_ => {
                            Swal.close();
                            document.location.reload();
                        })
                        return
                    }

                    formData.salaire = parseInt(formData.salaire.trim().replaceAll(" ", ''), 10);

                if (document.location.pathname.includes("edition")) {
                    formData.offre_uid =$("#id_offre").val()
                }

                    formData.status = result.isConfirmed ? 2 : 1

                    console.log(formData)

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
                            let post_result = await submit_form(formData);
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
                                title: "La mise à jour a été effectué avec succès!",
                                text: "Redirection en cours..."
                            }).then(
                                _ => document.location = document.location.origin + "/organisations/offers"
                            )
                        }
                        if(result.dismiss === Swal.DismissReason.dismiss) {
                            Toast.fire({
                                icon: 'error',
                                title: "Erreur lors de la publication !",
                                text: "Veuillez ré-essayez plus tard, mise à jour de la page en cours..."
                            }).then(
                                _ => document.location.reload()
                            )
                        }
                    });
                }
            })
        });
    });

   /* var heart=document.querySelector(".fa-heart");
    heart.addEventListener('click',function(){
        heart.classList.toggle('heart');
    });*/


    /*var share=document.querySelector(".fa-share-alt");
    share.addEventListener('click',function(){
        share.classList.toggle('share');
    });*/



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

        // The map, centered at Uluru
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

        google.maps.event.addListener(map, 'click', function( event ){
            clearOverlays();
            update_loc_inputs(event.latLng.lat(), event.latLng.lng());

            var myLatlng = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng() );
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Localisation de la mission!'
            });
            markersArray.push(marker);
        })
    }

    initMap();

    /*let m = document.getElementById("map")
    if (m) {
        m.addEventListener("click", function (e) {
            console.log("e", e)
            alert( "Latitude: "+e.latLng.lat()+" "+", longitude: "+e.latLng.lng() );
        })
    }*/


    /*google.maps.event.addListener(map, 'click', function( event ){
        alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+event.latLng.lng() );

        var myLatlng = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng() );
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Localisation de la mission!'
        });
    });*/

})
