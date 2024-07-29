const config = require('../../config/config')
const { ADMIN, USER } = require('../../config/policies.constants')
const { isValidPassword } = require('../../utils/hashing')

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
        if (email === config.ADMIN_USER && password === config.ADMIN_USER_PASS) {
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
                    throw CustomError.createError({
                        name: 'MissingDocuments',
                        cause: `Se detectó documentación faltante.`,
                        message: 'The user needs to complete his documentation',
                        code: ErrorCodes.NOT_FOUND
                    })
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
}

module.exports = UsersServices