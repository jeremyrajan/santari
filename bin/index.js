#!/usr/bin/env node

const santariStarter = require('../src/index');
const logger = require('../src/libs/logger');
const args = require('yargs')
  .usage('Usage: $0 --repo [repo name]')
  .example('$0 --repo jeremyrajan/frontend-starter', 'Check the dependencies and sends a PR')
  .demand(['repo'])
  .argv;

if (!args.repo) {
  logger.error('Repo is not supplied!');
  process.exit(0);
}

santariStarter(args.repo, (err, result) => {
  if (err) {
    return logger.error(err);
  }
  if (!result.status) {
    return logger.success(result);
  }
  logger.success('\nCongratulations! PR is created. Following are the details: ');
  logger.success(result);
});
