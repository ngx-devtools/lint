const { Transform } = require('stream');
const { join } = require('path');
const { existsSync } = require('fs');
const { Linter, Configuration } = require('tslint');

const lintOptions = {
  fix: false,
  formattersDirectory: "node_modules/custom-tslint-formatters/formatters",
  formatter: 'grouped',
};
const tslintConfigPath = join(process.env.APP_ROOT_PATH, 'tslint.json');

const tslinter = () => { 
  const transformStream = new Transform({
    objectMode: true,
    transform (file, enc, done) {
      const linter = new Linter(lintOptions);
      const configuration = Configuration.findConfiguration(tslintConfigPath, file.path).results;
      linter.lint(file.path, file.contents.toString('utf8'), configuration);
      file.tslint = linter.getResult();
      done(null, file);
    }
  });
  return transformStream;
};

module.exports = tslinter;
