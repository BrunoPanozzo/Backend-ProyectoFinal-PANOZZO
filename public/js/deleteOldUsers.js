document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.getElementsByClassName("btn-deleteOldUsers")
    // Convertir la coleccion a un array para que sea mas facil manipularla
    const allDeleteButtons = Array.from(buttons)    
    allDeleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {  
            fetch(`/api/users/`, {
                method: 'DELETE'
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