window.addEventListener("DOMContentLoaded", (event) => {
    const shrink_btn = document.querySelector(".shrink-btn");
    const sidebar_links = document.querySelectorAll(".sidebar-links a");
    const active_tab = document.querySelector(".active-tab");
    const shortcuts = document.querySelector(".sidebar-links h4");
    const tooltip_elements = document.querySelectorAll(".tooltip-element");


    shrink_btn.addEventListener("click", () => {

        if (localStorage.getItem("shrink") === "0") {
            localStorage.setItem("shrink", "1")
        } else {
            localStorage.setItem("shrink", "0")
        }

        document.body.classList.toggle("shrink");
        setTimeout(moveActiveTab, 400);

        shrink_btn.classList.add("hovered");

        setTimeout(() => {
            shrink_btn.classList.remove("hovered");
        }, 500);
    });

    function changeLink() {
        sidebar_links.forEach((sideLink) => {
            sideLink.classList.remove("active")
        });

        this.classList.add("active");
        activeIndex = this.dataset.active;

        moveActiveTab();
    }

    let activeIndex = getTranslation();

    sidebar_links.forEach((sideLink) => sideLink.classList.remove("active"));
    let topPosition = activeIndex * 59 + 3;

    if (activeIndex > 1) {
        topPosition += 17 + shortcuts.clientHeight;
    }

    active_tab.style.top = `${topPosition}px`;
    sidebar_links[activeIndex].classList.add("active");
    moveActiveTab()

    function moveActiveTab() {
        let topPosition = activeIndex * 59 + 3;

        if (activeIndex > 1) {
            topPosition += 17 + shortcuts.clientHeight;
        }

        active_tab.style.top = `${topPosition}px`;
    }

    function showTooltip() {
        let tooltip = this.parentNode.lastElementChild;
        let spans = tooltip.children;
        let tooltipIndex = this.dataset.tooltip;

        Array.from(spans).forEach((sp) => sp.classList.remove("show"));
        spans[tooltipIndex].classList.add("show");

        tooltip.style.top = `${(100 / (spans.length * 2)) * (tooltipIndex * 2 + 1)}%`;
    }

    tooltip_elements.forEach((elem) => {
        elem.addEventListener("mouseover", showTooltip);
    });



    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', ()=>{
            Swal.fire({
                title: 'Déconnexion en cours',
                html: `<b>Veuillez ne pas fermer cette page jusqu'à la fin de la déconnexion!</b>`,
                timer: 2000,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                didOpen: async () => {
                    Swal.showLoading();
                    Swal.stopTimer();
                    let logoutResult = await request_logout();
                    if (logoutResult) {
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
                        (_) => document.location.href = `${document.location.origin}/authentification/connexion`
                    )
                }
                if(result.dismiss === Swal.DismissReason.dismiss) {
                    Swal.fire({
                        icon: 'error',
                        title: "Erreur lors de la déconnexion !",
                        text: "Veuillez ré-essayez plus tard!"
                    }).then(_ => {
                        Swal.close();
                        document.location.reload();
                    })
                }
            });
            // We add the show-menu class to the div tag with the nav__menu class

        })
    }
});



function getTranslation() {
    let path_name = document.location.pathname;

    if (path_name.includes("/administration")) {
        if(path_name.includes("/users")){
            return 2;
        }
        if(path_name.includes("/organisations")) {
            return 3;
        }
        return 2;
    }

    if (path_name.includes("/organisations")) {
        if (path_name.includes("/members")) {
            return 2;
        }
        if(path_name.includes("/offers")) {
            return 4;
        }
        return 3;
    }

    if (path_name.includes("/offres")) {
        if(path_name.includes("mes-candidatures")) return 2;
        if(path_name.includes("candidature")) return 2;
        return 1;
    }
    return 0
}

async function request_logout() {
    return new Promise(
        (resolve) => {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/authentification/logout",
                dataType: "json",
                encode: true,
                data: {},
            }).done(function (data) {
                resolve(true);
            }).fail(
                (function (xhr, status, error) {
                    console.log(xhr);
                    resolve(false)
                })
            )
        }
    )
}
