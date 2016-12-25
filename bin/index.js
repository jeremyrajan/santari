#!/usr/bin/env node

const santariStarter = require('../src/index');
const logger = require('../src/libs/logger');
const packageJSON = require('../package.json');

// check the version number for checking.
// dont want to get it into yargs yet, as we want to demand --repo always.
if (process.argv.pop() === '-v') {
  logger.info(`Santari version: ${packageJSON.version}`);
  process.exit(0);
}

const args = require('yargs')
  .usage('Usage: $0 --repo [repo name]')
  .example('$0 --repo jeremyrajan/frontend-starter', 'Check the dependencies and sends a PR')
  .demand(['repo'])
  .argv;

// if we cant find the repo then bail.
if (!args.repo) {
  logger.error('Repo is not supplied!');
  process.exit(0);
}

santariStarter(args.repo, (err, result) => {
  if (err) {
    return logger.error(err);
  }
  if (!result.status) {
    return logger.success(JSON.stringify(result, null, 2));
  }
  logger.success('\nCongratulations! PR is created. Following are the details: ');
  logger.success(JSON.stringify(result, null, 2));
});
