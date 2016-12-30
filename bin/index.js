#!/usr/bin/env node

const santariStarter = require('../src/index');
const logger = require('../src/libs/logger');
const packageJSON = require('../package.json');
const server = require('../web/backend');
const ports = require('../.santari.json').ports;
let args = require('yargs');

const init = () => {
  if (args.argv.v) {
    logger.info(`Santari version: ${packageJSON.version}`);
    process.exit(0);
  }

  if (args.argv._.length > 0 && args.argv._.find(a => a.includes('server'))) {
    server.init(ports);
    return;
  }

  // re-init
  args = args.usage('Usage: $0 --repo [repo name]')
          .example('$0 --repo jeremyrajan/frontend-starter', 'Check the dependencies and sends a PR')
          .demand(['repo'])
          .argv;

  // if we cant find the repo then bail.
  if (!args.repo) {
    logger.error('Repo is not supplied!');
    process.exit(0);
  }

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
};

init();
