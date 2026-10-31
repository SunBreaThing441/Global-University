/* eslint-disable import-x/no-commonjs, import-x/no-amd, import-x/no-import-module-exports */
try {
  module.exports = require('kolibri-jest-config/jest.conf/babel.config');
} catch (e) {
  module.exports = require('./packages/kolibri-jest-config/jest.conf/babel.config');
}
