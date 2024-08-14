const BaseRouter = require('./router')

const { userIsLoggedIn, userIsAdmin } = require('../middlewares/user.middleware')

const UsersController = require('../controllers/users.controller')
const { PUBLIC, USER, ADMIN, SUPER_ADMIN, USER_PREMIUM } = require('../config/policies.constants')

const { verifyToken } = require('../utils/jwt')
const passportMiddleware = require('../middlewares/passport.middleware')
const uploader = require('../middlewares/uploadFile.middleware')

const { userWithValidCertificates } = require('../middlewares/user.middleware')

const withController = callback => {
    return (req, res) => {
        const controller = new UsersController()
        return callback(controller, req, res)
    }
}

class UserRouter extends BaseRouter {
    init() {

        this.post('/login', [PUBLIC], withController((controller, req, res) => controller.login(req, res)))

        this.get('/private', [ADMIN, SUPER_ADMIN], verifyToken, withController((controller, req, res) => controller.private(req, res)))

        this.get('/current', [USER, ADMIN, SUPER_ADMIN], passportMiddleware('jwt') /*passport.authenticate('jwt', {session: false})*/, withController((controller, req, res) => controller.current(req, res)))

        this.put('/premium/:uid', [USER, USER_PREMIUM, ADMIN, SUPER_ADMIN], userWithValidCertificates, withController((controller, req, res) => controller.changeRole(req, res)))

        this.post('/:uid/documents', [USER, USER_PREMIUM, ADMIN, SUPER_ADMIN], uploader.fields([
            {
                name: 'profile',
                maxCount: 1
            },
            {
                name: 'product',
                maxCount: 1
            },
            {
                name: 'comprobante',
                maxCount: 1
            }
        ]), withController((controller, req, res) => controller.addFiles(req, res)))

        this.get('/', [ADMIN, SUPER_ADMIN], userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.getUsers(req, res)))

        this.delete('/:uid', [ADMIN, SUPER_ADMIN], userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.deleteUser(req, res)))

        this.delete('/', [ADMIN, SUPER_ADMIN], userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.deleteOldUsers(req, res)))

    }
}

module.exports = UserRouter