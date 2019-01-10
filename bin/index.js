#!/usr/bin/env node
const yargs = require('yargs');
const santariStarter = require('../src/index');
const logger = require('../src/libs/logger');
const packageJSON = require('../package.json');

// check the version number for checking.
// dont want to get it into yargs yet, as we want to demand --repo always.
const checkArgs = process.argv;
if (checkArgs[checkArgs.length - 1] === '-v') {
  logger.info(`Santari version: ${packageJSON.version}`);
  process.exit(0);
}

const args = yargs
  .option('repo', {
    alias: 'r',
    describe: 'The repository to target your pull request. Reads from package.json if not supplied'
  })
  .option('dry', {
    alias: 'd',
    describe: 'Peform a dry run and print JSON to the console.'
  })
  .option('host', {
    alias: 'h',
    describe: 'Override the default github.com host. Useful for targeting Github enterprise'
  })
  .option('token', {
    alias: 't',
    describe: 'Redundant with environment variable GITHUB_KEY, will override if supplied. Can also be used instead of the environment variable.'
  })
  .option('config', {
    alias: 'c',
    describe: 'Config file. Defaults to ".santari.json". Keys supplied can match the input options on the cli.'
  })
  .option('msg', {
    alias: 'm',
    describe: 'Commit message header to use. Defaults to "chore(package.json): update dependencies". Body is written dynamically based on what is updated.'
  })
  .usage('Usage: $0 --repo [repo name]')
  .example('$0 --repo jeremyrajan/frontend-starter', 'Check the dependencies and sends a PR')
  .argv;

santariStarter(args, (err, result) => {
  if (err) {
    return logger.error(err);
  }
  if (!result.status) {
    return logger.success(JSON.stringify(result, null, 2));
  }
  logger.success('\nCongratulations! PR is created. Following are the details: ');
  logger.success(JSON.stringify(result, null, 2));
});
