class SimpleUserDTO {

    constructor(user) {
        this.firstName = user.firstName
        this.lastName = user.lastName,
        this.email = user.email
        this.rol = user.rol
    }
        
}
module.exports = { SimpleUserDTO }