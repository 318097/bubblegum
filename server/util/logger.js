const _ = require('lodash');
const config = require('../config/config');

const logger = {
  log: (...args) => {
    console.log('[LOG]', args);
  }
};

module.exports = logger;
