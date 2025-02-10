const GeoLocate = require("hapi-geo-locate");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const hapiDevError = require('hapi-dev-errors');
const Basic = require("@hapi/basic");
const Cookie = require("@hapi/cookie");
const loggerPino = require("./logger.js");

const plugin = [
  {
    plugin: GeoLocate,
    options: {
      enabledByDefault: true
    }
  },
  {
    plugin: Inert,
  },
  {
    plugin: Vision,
  },
  {
    plugin: hapiDevError,
    options: {
      showErrors: process.env.NODE_ENV !== 'production',
      toTerminal: true
    }
  },
  {
    plugin: Basic
  },
  {
    plugin: Cookie
  },
  {
    plugin: require('hapi-pino'),
    options: {
      instance: loggerPino, // Gunakan logger kustom di sini
    }
  }
];

module.exports = plugin;