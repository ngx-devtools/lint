
const { resolve } = require('path');

if (!(process.env.APP_ROOT_PATH)) {
  process.env.APP_ROOT_PATH = resolve();
}

exports.tslint = require('./utils/ts-linter');
exports.reporter = require('./utils/ts-linter-report');