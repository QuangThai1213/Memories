const chalk = require('chalk');
const sout = console.log;

function log(text) {
    sout(chalk.green(text));
}

function warn(text) {
    sout(chalk.yellow(text));
}

function error(text) {
    sout(chalk.red(text));
}

module.exports = { log, warn, error }