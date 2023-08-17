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

const TipsToast = Swal.mixin({
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
        event.preventDefault();

        let formData = {
            nom_de_famille: $("#nom_famille").val(),
            prenom: $("#prenom").val(),
            numero_telephone: $("#numero_telephone").val().replaceAll(' ', '').trim(),
            email: $("#email").val(),
            mot_de_passe: $("#password").val(),
            c_mot_de_passe: $("#cpassword").val(),

        };


        $.ajax({
            type: "POST",
            url: "http://localhost:3000/authentification/register",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            Toast.fire({
                icon: 'success',
                title: "L'inscription a été effectué avec succès!",
                text: "Redirection en cours vers la page de connexion ..."
            }).then(
                (_) => document.location.href = document.location.origin + "/"
            )
        }).fail(
            (function (xhr, status, error) {
                TipsToast.fire({
                    icon: 'error',
                    title: "Oops, votre requête a rencotré l'erreur suivante...",
                    text: xhr.responseJSON.user_message
                })
            })
        );

    });
});
