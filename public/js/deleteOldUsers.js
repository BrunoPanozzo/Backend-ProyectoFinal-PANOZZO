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
                        Swal.fire({
                            title: 'Se eliminaron todos los usuarios inactivos!',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload()
                            }
                        })
                    }
                    else if (result.status === 209) {
                        Swal.fire({
                            title: 'No existen usuarios inactivos!',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload()
                            }
                        })
                    }
                    else {
                        Swal.fire({
                            title: 'No se pudieron eliminar los usuarios inactivos!',
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