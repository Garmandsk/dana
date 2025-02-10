const hapiDevError = require('hapi-dev-errors');
const Cookie = require("@hapi/cookie");
const loggerPino = require("./logger.js");

const plugin = [
  {
    plugin: hapiDevError,
    options: {
      showErrors: process.env.NODE_ENV !== 'production',
      toTerminal: true
    }
  },
  {
    plugin: Cookie
  },
  {
    plugin: require('hapi-pino'),
    options: {
      instance: loggerPino, // Gunakan logger kustom di sini
    }
  },
];

module.exports = plugin;