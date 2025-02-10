const pino = require("pino");
const { PINO_LOGGER_TOKEN } = process.env;

const logger = pino(
  {
    transport: {
      targets: [
        {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
        {
          target: "@logtail/pino",
          options: { sourceToken: PINO_LOGGER_TOKEN },
        },
      ],
    },
  },
);

module.exports = logger;

/** Level
{ labels:
   { '10': 'trace',
     '20': 'debug',
     '30': 'info',
     '40': 'warn',
     '50': 'error',
     '60': 'fatal' },
  values:
   { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 } }
  */