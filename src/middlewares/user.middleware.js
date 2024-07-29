const { ADMIN, USER, USER_PREMIUM } = require("../config/policies.constants")

const UsersServices = require('../services/users/users.service')
const { UserDAO } = require('../dao/factory')

const userDAO = UserDAO()
const usersServices = new UsersServices(userDAO)

module.exports = {
    userIsLoggedIn: (req, res, next) => {
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (!isLoggedIn) {
            return res.status(401).json({ error: 'El usuario debe tener una sesion iniciada!' })
        }

        next()
    },
    userIsNotLoggedIn: (req, res, next) => {
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (isLoggedIn) {
            return res.status(401).json({ error: 'El usuario NO debe tener una sesion iniciada!' })
        }

        next()
    },
    userIsAdmin: (req, res, next) => {
        if (req.session.user.rol != ADMIN) {
            return res.status(403).json({ error: 'El usuario debe tener permisos de ADMIN!' })
        }

        next()
    },
    userIsNotAdmin: (req, res, next) => {
        if (req.session.user?.rol == ADMIN) {
            return res.status(403).json({ error: 'El usuario debe ser distino al ADMIN!' })
        }

        next()
    },
    userIsAdminOrPremium: (req, res, next) => {
        if ((req.session.user.rol != USER_PREMIUM) && (req.session.user.rol != ADMIN)) {
            return res.status(403).json({ error: 'El usuario debe tener permisos de USER_PREMIUM o ADMIN!' })
        }

        next()
    },
    userWithValidCertificates: async (req, res, next) => {
        const userId = req.params.uid
        //puedo estar intentando cambiar a PREMIUM, debo verificar que disponga de la documentación exigida
        const result = await usersServices.userWithValidCertificates(userId)
        if (!result)
            return res.status(403).json({ error: 'El usuario no posee la documentación necesaria para modificar su rol a USER_PREMIUM!' })

        next()
    }
}