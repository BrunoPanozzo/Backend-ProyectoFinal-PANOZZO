document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.getElementsByClassName("btn-deleteUser")
    // Convertir la coleccion a un array para que sea mas facil manipularla
    const allDeleteButtons = Array.from(buttons)    
    allDeleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {  
            fetch(`/api/users/${btn.id}`, {
                method: 'DELETE'
            })
                .then((result) => {
                    if (result.status === 200) {
                        Swal.fire({
                            title: 'Se eliminó con éxito el usuario!',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload()
                            }
                        })
                    }
                    else {
                        Swal.fire({
                            title: 'No se pudo eliminar el usuario!',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload()
                            }
                        })
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
        })
    })
})