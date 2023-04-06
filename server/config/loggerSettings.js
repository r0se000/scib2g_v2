/** ================================================================
 *  winston logger settings
 *  ※ winston Log Level
 *     error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 *  @author JG, Jo
 *  @since 2021.03.31
 *  ================================================================
 */

const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const logDir = './logs';
const { combine, timestamp, printf } = winston.format;

// log format 
const logFormat = printf(({ timestamp, level, message, stack }) => {
    if (stack) return `[${timestamp}, ${level}] ${JSON.stringify(message, null, 4)}\n${stack}`;
    else return `[${timestamp}, ${level}] ${JSON.stringify(message, null, 4)}`;
});

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat
    ),
    transports: [
        // error level log file setting
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true
        }),
        // warn level log file setting
        new winstonDaily({
            level: 'wran',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/warn',
            filename: `%DATE%.warn.log`,
            maxFiles: 30,
            zippedArchive: true
        }),
        // info level log file setting
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/info',
            filename: `%DATE%.info.log`,
            maxFiles: 30,
            zippedArchive: true
        }),
        // debug level log file setting
        new winstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug',
            filename: `%DATE%.debug.log`,
            maxFiles: 30,
            zippedArchive: true
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            //winston.format.simple(), // `${info.level}: ${info.message} JSON.stringify({ ...rest })`
            //winston.format.prettyPrint()
        ),
    }));
}

module.exports = logger;