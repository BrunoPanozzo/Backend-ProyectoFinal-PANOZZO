//const config = require('../../config/config')
const { ADMIN, USER } = require('../../config/policies.constants')
const { isValidPassword } = require('../../utils/hashing')

const transport = require("../../utils/transport")
//const { GMAIL_ACCOUNT } = require('../../config/config')

const { CustomError } = require('../errors/CustomError')
const { ErrorCodes } = require('../errors/errorCodes')

class UsersServices {

    constructor(dao) {
        this.dao = dao
    }

    async login(email, password) {
        if (!email || !password) {
            // return res.status(400).json({ error: 'Credenciales inválidas!' })
            // return res.sendUserError('Credenciales inválidas!')
            throw new Error('invalid credentials')
        }

        //verifico si es el usuario "ADMIN"
        let user
        if (email === process.env.ADMIN_USER && password === process.env.ADMIN_USER_PASS) {
            user = {
                rol: ADMIN,
                firstName: "Coder",
                lastName: "House",
                email: email,
                password: password,
                age: 47,
                cart: null,
                _id: "dflksgd8sfg7sd890fg",
                last_connection: Date.now()
            }
        }
        else {
            // user = await userModel.findOne({ email })
            user = await this.dao.login({ email: email })
            if (!user) {
                // return res.status(400).json({ error: 'El Usuario no existe!' })
                //return res.sendUserError('El Usuario no existe!')
                throw new Error('not found')
            }

            if (!isValidPassword(password, user.password)) {
                // return res.status(401).json({ error: 'Password inválida' })
                //return res.sendUnauthorizedError('Password inválida')
                throw new Error('invalid password')
            }
        }
        return user
    }

    async changeRole(userId) {
        return await this.dao.changeRole(userId)
    }

    async addFiles(userId, files) {
        try {
            const user = await this.dao.getUserById(userId)
            if (!user) {
                throw new Error('not found')
            }
            const filesArray = []
            if (files.profile[0])
                filesArray.push(files.profile[0])
            if (files.product[0])
                filesArray.push(files.product[0])
            if (files.comprobante[0])
                filesArray.push(files.comprobante[0])
            for (const file of filesArray) {
                const document = {
                    name: file.originalname,
                    reference: file.path
                }
                await this.dao.addFile(userId, document)
            }
            return true
        }
        catch (err) {
            throw CustomError.createError({
                name: 'UploadFileFailed',
                cause: `No se pudieron subir algunos de los archivos a la base de datos.`,
                message: 'Error trying to load a file',
                code: ErrorCodes.DATABASE_ERROR
            })
        }
    }

    async userWithValidCertificates(userId) {
        try {
            const user = await this.dao.getUserById(userId)
            if (!user) {
                throw new Error('not found')
            }
            const requiredDocuments = ['profile', 'comprobanteDomicilio', 'comprobanteCuenta']
            const hasRequiredDocuments = requiredDocuments.every(doc => user.documents.some(d => (d.reference).includes(doc)))
            if (user.rol == USER) {
                if (!hasRequiredDocuments)
                    return false
                else
                    return true
            }
            return true
        }
        catch (err) {
            throw CustomError.createError({
                name: 'MissingDocuments',
                cause: `Se detectó documentación faltante.`,
                message: 'The user needs to complete his documentation',
                code: ErrorCodes.NOT_FOUND
            })
        }
    }

    async getUsers() {
        return await this.dao.getUsers()
    }

    async deleteUser(userId) {
        try {
            const user = await this.dao.getUserById(userId)
            await this.dao.deleteUser(userId)
            const title = 'Eliminación de cuenta'
            const subject = 'Su cuenta ha sido cerrada'
            const texto1 = 'Su cuenta ha sido cerrada por el administrador del sitio.'
            const texto2 = 'Para ingresar nuevamente, deberá volver a registrarse.'
            await this.notifyUser(user, title, subject, texto1, texto2)
            return true
        }
        catch (err) {
            return false
        }
    }

    async deleteOldUsers() {
        try {
            const users = await this.getUsers()
            if (!Array.isArray(users)) {
                throw new Error('Expected getUsers() to return an array.');
            }
            //vamos a filtrar los usuarios de mas de 2 días sin actividad
            const now = new Date()
            const twoDaysAgo = new Date(now);
            twoDaysAgo.setDate(now.getDate() - 2);
            const filteredUsers = users.filter(user => user.last_connection < twoDaysAgo)
            return filteredUsers
        }
        catch (err) {
            return []
        }
    }

    async notifyUser(user, title, subject, texto1, texto2) {
        try {
            await transport.sendMail({
                from: process.env.GMAIL_ACCOUNT,
                to: `${user.email}`,
                subject: subject,
                html: `<div>
                       <h1>${title}</h1>
                       <h2>HOLA "${user.firstName} ${user.lastName}"</h2>
                       <p>${texto1}
                       <h3>${texto2}
                       </div>`,
                attachments: []
            })
            // envío de correo exitoso
            return true
        }
        catch (err) {
            return false
        }
    }

    async deleteAndNotifyOldUsers(users) {
        try {
            if (!Array.isArray(users)) {
                throw new Error('Users should be an array.');
            }
            let user
            for (let i = 0; i < users.length; i++) {
                user = users[i]
                //borro el usuario
                await this.dao.deleteUser(user._id)
                //notifico de tal accion
                const title = 'Eliminación de cuenta'
                const subject = 'Su cuenta se ha eliminado por inactividad'
                const texto1 = 'Su cuenta se ha cerrado porque no se ha registrado actividad durante los últimos 2 días.'
                const texto2 = 'Para ingresar nuevamente, deberá volver a registrarse.'
                await this.notifyUser(user, title, subject, texto1, texto2)
            }
            return true
        }
        catch (err) {
            return false
        }
    }
}

module.exports = UsersServices