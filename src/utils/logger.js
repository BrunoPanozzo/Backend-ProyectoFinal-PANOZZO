const winston = require('winston');

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'blue',
        http: 'green',
        debug: 'white'
    }
}
winston.addColors(customLevelsOptions.colors)

const requestLoggerFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
        const { ip, method, path } = message
        if (ip && method && path)
            return `${ip} - [${timestamp}] ${method} ${path}`
        else
            return `[${timestamp}] ${message}`
    })
)

const errorLoggerFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message, timestamp }) => {
        return `[${timestamp}] ${message}`
    })
)

const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            )
        })
    ]
})

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        // new winston.transports.Console({
        //     level: 'info',
        //     format: winston.format.combine(
        //         winston.format.colorize({ colors: customLevelsOptions.colors }),
        //         winston.format.simple()
        //     )
        // }),
        new winston.transports.File({
            level: 'info',
            filename: `${__dirname}/../logs/access.log`,
            format: requestLoggerFormat
        }),
        new winston.transports.File({
            filename: `${__dirname}/../logs/errors.log`,
            level: 'error',
            format: errorLoggerFormat
        })
    ]
})

const logger = process.env.NODE_ENV == 'production'
    ? prodLogger
    : devLogger

/**
 * @type {import('express').RequestHandler}
 */
const useLogger = (req, res, next) => {
    req.logger = logger

    req.logger.http(`Request at endpoint: ${req.url}`)

    req.logger.info({
        ip: req.ip,
        method: req.method.toUpperCase(),
        path: req.path
    })
    
    next()
}

module.exports = { useLogger }
