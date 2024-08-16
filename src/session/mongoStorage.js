const MongoStore = require('connect-mongo')
const session = require('express-session')
const { DBNAME, MONGO_URL, SECRET } = require('../config/config')

const storage = MongoStore.create({
    dbName: DBNAME,
    mongoUrl: MONGO_URL,
    ttl: 60
}) 

module.exports = session({
    store: storage,
    secret: SECRET,
    resave: false,
    saveUninitialized: true
})

// module.exports = session({
//     store: storage,
//     secret: SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true } // Solo en HTTPS
// })