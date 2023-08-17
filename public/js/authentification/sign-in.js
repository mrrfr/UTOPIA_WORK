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
    $("form").submit(function (event) {

        let formData = {
            email: $("#email").val(),
            mot_de_passe: $("#password").val(),
        };

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/authentification/connexion",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            Toast.fire({
                icon: 'success',
                title: "La connexion a été effectué avec succès!",
                text: "Redirection en cours..."
            }).then(
                (_) => document.location.href = document.location.origin + "/"
            )
            /*Swal.fire({
                icon: 'success',
                title: "Succès !",
                text: data.user_message
            }).then(
                (_) => document.location.href = document.location.origin + "/"
            )*/
        }).fail(
            (function (xhr, status, error) {
                if (xhr.status === 401) {
                    Toast.fire({
                        icon: 'error',
                        title: "Identifiants incorrects",
                    })
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: "Oops, votre requête a rencotré l'erreur suivante...",
                        text: xhr.responseJSON.user_message
                    })
                }
            })
        );

        event.preventDefault();
    });
});
