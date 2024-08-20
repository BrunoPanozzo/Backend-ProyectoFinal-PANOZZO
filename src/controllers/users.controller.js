const UsersServices = require('../services/users/users.service')
const SessionsServices = require('../services/sessions/sessions.service')

const { generateToken } = require('../utils/jwt')

const { UserDAO } = require("../dao/factory")
const { UserDTO } = require('../dao/dto/user.dto')
const { SimpleUserDTO } = require('../dao/dto/simpleUser.dto')

class UsersController {

    constructor() {
        const userDAO = UserDAO()
        this.usersService = new UsersServices(userDAO)
        this.sessionsService = new SessionsServices(userDAO)
    }

    #handleError(res, err) {
        if (err.message === 'not found') {
            //return res.status(404).json({ error: 'Not found' })
            res.sendNotFoundError(err)
        }

        if (err.message === 'invalid credentials') {
            //return res.status(400).json({ error: 'Invalid parameters' })
            res.sendUserError(err)
        }

        if (err.message === 'invalid password') {
            res.sendUnauthorizedError(err)
        }

        //return res.status(500).json({ error: err })
        return res.sendServerError(err)
    }

    async login(req, res) {
        try {
            const { email, password } = req.body

            const user = await this.usersService.login(email, password)

            const credentials = { id: user._id.toString(), email: user.email, rol: user.rol }
            const accessToken = generateToken(credentials)

            //le indico al cliente que guarde la cookie
            res.cookie('userToken', accessToken, { maxAge: 60 * 60 * 1000, httpOnly: true })
            //envío el token
            // res.status(200).json({ status: 'success' })
            res.sendSuccess(`Bienvenido ${email}, ud se ha logeado exitosamente.!`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            //return res.sendServerError(err)
            return this.#handleError(res, err)
        }
    }

    private(req, res) {
        try {
            const { email } = req.authUser
            //res.send(`Bienvenido ${email}, este es contenido privado y protegido`)
            res.sendSuccess(`Bienvenido ${email}, este es contenido privado y protegido`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    current(req, res) {
        res.sendSuccess(new UserDTO(req.user))
    }

    async changeRole(req, res) {
        try {
            const userId = req.params.uid
            const result = await this.usersService.changeRole(userId)
            if (!result) {
                return res.sendServerError(`No se pudo cambiar el rol del usuario '${userId}'`)
            }
            return res.sendSuccess(`El usuario '${userId}' cambió su rol.`)   
        }
        catch (err) {
            return res.sendServerError(err)
        }
    }

    async addFiles(req, res) {
        try {
            const userId = req.params.uid
            const files = req.files
            if (!files) //si no existe, significa que hubo un error al subir los archivos
                res.sendUserError(`No se pudieron subir los archivos para el usuario '${userId}'.`)
            const result = await this.usersService.addFiles(userId, files)
            result
                ? res.sendSuccess(`Se cargaron nuevos archivos para el usuario '${userId}'.`)
                : res.sendServerError(`No se pudieron subir los archivos para el usuario '${userId}'.`)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

    async getUsers(req, res) {
        try {
            const allUsers = await this.usersService.getUsers()
            const usersDTOs = allUsers.map(user => new SimpleUserDTO(user))
            return res.sendSuccess(usersDTOs)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

    async deleteOldUsers(req, res) {
        try {
            const oldUsers = await this.usersService.deleteOldUsers()
            if (oldUsers.length == 0) {
                req.logger.info('Warning: ' + "No existen usuarios inactivos")
                return res.status(209).send("No existen usuarios inactivos")
            }
            
            const result = await this.usersService.deleteAndNotifyOldUsers(oldUsers)
            if (!result) {
                return res.sendServerError(`No se pudieron eliminar los usuarios con cuentas inactivas`)
            }            
            return res.sendSuccess(oldUsers)            
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.uid
            const result = await this.usersService.deleteUser(userId)
            if (!result) {
                return res.sendServerError(`No se pudo eliminar el usuario '${userId}'`)
            }
            return res.sendSuccess(result)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

}

module.exports = UsersController