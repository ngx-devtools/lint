const { Transform } = require('stream');
const { resolve, join } = require('path');
const { Linter, Configuration } = require('tslint');

const lintOptions = {
  fix: false,
  formattersDirectory: "node_modules/custom-tslint-formatters/formatters",
  formatter: 'grouped',
};

class LinterTransform extends Transform {

  constructor(){
    super({ objectMode: true });
  }

  _transform(file, enc, done) {
    const linter = new Linter(lintOptions);
    const configuration = Configuration.findConfiguration(join(resolve(), 'tslint.json'), file.path).results;
    linter.lint(file.path, file.contents.toString('utf8'), configuration);
    file.tslint = linter.getResult();
    done(null, file);
  }
  
}

module.exports = () => new LinterTransform();