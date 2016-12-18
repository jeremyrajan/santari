const chalk = require('chalk');
// simple logger
module.exports = {
  error(...args) {
    console.log('\n', chalk.red(...args));
  },
  info(...args) {
    console.log('\n', chalk.blue(...args));
  },
  log(...args) {
    console.log('\n', ...args);
  },
  warn(...args) {
    console.log('\n', chalk.yellow(...args));
  },
  success(...args) {
    console.log('\n', chalk.green(...args));
  }
};
