const pino = require("pino");

const token = "qSXQoSdJFYyri5nZmXpEqsZX";
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
          options: { sourceToken: token },
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