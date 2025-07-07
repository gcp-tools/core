import winston from 'winston'

const levelPrefixes = {
  info: '[info]',
  warn: '[warn]',
  error: '[error]',
  debug: '[debug]',
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const prefix =
        levelPrefixes[level as keyof typeof levelPrefixes] || `[${level}]`
      const metaString = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : ''
      return `${timestamp} ${prefix} ${message}${metaString}`
    }),
  ),
  transports: [new winston.transports.Console()],
})

export default logger
