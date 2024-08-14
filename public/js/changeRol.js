document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.getElementsByClassName("btn-modifyUserRol")
    // Convertir la coleccion a un array para que sea mas facil manipularla
    const allDeleteButtons = Array.from(buttons);
    allDeleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {   
            fetch(`http://localhost:8080/api/users/premium/${btn.id}`, {
                method: 'PUT'
            })
                .then((result) => {
                    if (result.status === 200) {
                        window.location.reload()  // se recarga la página actual
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
        })
    })
})