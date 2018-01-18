const chalk = require('chalk');
const through = require('through');
const PluginError = require('plugin-error');

const { findFormatter } = require('tslint');

const log = (message, level) => {
  const tsLintWorldColor = chalk.cyan('tslint');
  const tslintError = chalk.red('error');
  const tslintMessage = chalk.white(message);

  const prefix = '[' + tsLintWorldColor + ']';
  if (level === "error") {
    console.log(`${prefix} ${tslintError}: ${tslintMessage}`);
  } else { 
    console.log(`${prefix} \n  ${tslintMessage}`);
  }
};

const getWarnings = (file) => {
  const formatterConstructor = findFormatter('grouped');
  const formatter = new formatterConstructor();
  const warnings = file.tslint.failures.filter(failure => failure.getRuleSeverity() === "warning");
  console.log(formatter.format(warnings));
};

const proseErrorFormat = (failure) => {
  const fileName = failure.getFileName();
  const failureString = failure.getFailure();
  const lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
  const line = lineAndCharacter.line + 1;
  const character = lineAndCharacter.character + 1;
  return `${fileName} [ ${line}, ${character} ]: ${failureString}`;
};

const reporter = () => {
  let totalReported = 0;
  let errorFiles = [], allFailures = [];

  const reportFailures = function(file) {
    if (file.tslint){
      if (file.tslint.errorCount > 0) {
        errorFiles.push(file);
        Array.prototype.push.apply(allFailures, file.tslint.failures);
      } else if (file.tslint.warningCount > 0) {
        getWarnings(file);
      }
    };
    this.emit('data', file);
  };

  const throwErrors = function() {
    if (errorFiles.length > 0) {
      let failuresToOutput = allFailures;

      const failureOutput = failuresToOutput.map(failure => proseErrorFormat(failure)).join(", ");
      log(failureOutput, 'error');

      return this.emit('error', new PluginError('tslint', `Failed to lint: ${failuresToOutput.length} errors.`));
    }
    this.emit("end");
  };

  return through(reportFailures, throwErrors);
};

module.exports = reporter;
