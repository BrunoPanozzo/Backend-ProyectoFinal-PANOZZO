//definir los paquetes que se van a utilizar
const express = require('express')
const expressHandlebars = require("express-handlebars")
const cors = require('cors')  // Import the cors package

//importo las variables de entorno
const { MONGO_URL, DBNAME, PORT } = require('./config/config')

const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const { Server } = require('socket.io')

//definir paquetes de passport
const passport = require('passport')
const initializeStrategy = require('./config/passport.config')

//definir paquetes y config de mongo
const sessionMiddleware = require('./session/mongoStorage')

//definir los routers
const { routers } = require('./routes/routersSetup')

const dbMessageManager = require('./dao/dbManagers/MessageManager')
const { errorHandler } = require('./services/errors/errorHandler')

const { useLogger } = require('./utils/logger')
const swaggerJSDoc = require('swagger-jsdoc')
const { serve, setup } = require('swagger-ui-express')

//instanciar mi app
const app = express()

//configurar express para manejar formularios y JSON
app.use(express.static(`${__dirname}/../public`))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// configurar handlebars como nuestro template engine por defecto
const handlebars = expressHandlebars.create({
    defaultLayout: "main",
    handlebars: require("handlebars"),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    }
})
app.engine("handlebars", handlebars.engine)
app.set("views", `${__dirname}/views`)
app.set("view engine", "handlebars")

//Configurar las views para tener alcance a los archivos CSS, JS e IMAGES desde los routers
app.use('/products/detail', express.static(`${__dirname}/../public`));
app.use('/products/addCart', express.static(`${__dirname}/../public`));
app.use('/products/create', express.static(`${__dirname}/../public`));
app.use('/carts', express.static(`${__dirname}/../public`));

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación de Ecommerce API',
            description: 'API for Ecommerce!'
        },
    },
    apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions)

app.use('/apidocs', serve, setup(specs))

//configuro mi session en MongoDB
app.use(cookieParser())
app.use(sessionMiddleware)

// inicializamos Passport
initializeStrategy()
app.use(passport.initialize())
app.use(passport.session())

//logger config
app.use(useLogger)

// CORS options
const corsOptions = {
    credentials: true,
    origin: ['*'] // Whitelist the domains you want to allow
}

app.use(cors(corsOptions))  // Use the cors middleware with your options

const main = async () => {

    //configurar los routers
    for (const { path, router } of routers) {
        app.use(path, await router)
    }

    //seteo el uso de mi propio errorHandler
    app.use(errorHandler)

    let httpServer

    //configurar mongoose
    const port = PORT || 8080
    const mongo_URL = MONGO_URL || 'mongodb+srv://coderUser:coderPassword@coderclustertest.y46cxod.mongodb.net/?retryWrites=true&w=majority&appName=CoderClustertest'
    const mongo_DBNAME = DBNAME || 'ecommerce'
    await mongoose.connect(mongo_URL, { dbName: mongo_DBNAME })
        .then(() => {
            //crear un servidor HTTP
            httpServer = app.listen(port, () => {
                console.log(`Servidor listo escuchando en el puerto ${port}`)
            })
        })

    //Manager del chat
    const messageManager = new dbMessageManager()

    //crear un servidor WS
    const io = new Server(httpServer)

    let messagesHistory = []

    //conexion de un nuevo cliente a mi servidor WS
    io.on('connection', (clientSocket) => {
        // console.log(`Cliente conectado con ID: ${clientSocket.id}`)

        // clientSocket.on('saludo', (data) => {
        //     console.log(data)
        // })

        //sección de MESSAGES
        // enviar todos los mensajes hasta este momento
        for (const data of messagesHistory) {
            clientSocket.emit('message', data)
        }

        clientSocket.on('message', async data => {
            messagesHistory.push(data)
            messageManager.addMessage(data)
            io.emit('message', data)
        })

        clientSocket.on('userAuthenticated', data => {
            // notificar a los otros usuarios que se conecto
            clientSocket.broadcast.emit('newUserConnected', data)
        })
    })
}

main()