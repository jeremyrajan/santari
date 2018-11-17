const PromiseSeries = require('promise-series');
const Santari = require('./tasks/santari');
const logger = require('./libs/logger');
const prettyPrinter = require('./libs/prettyPrinter');

// init series promises.
const init = new PromiseSeries();
const tasks = new PromiseSeries();

const run = (args, cb) => {
  let santari;

  // try catch :)
  try {
    santari = new Santari(args);
  } catch (error) {
    logger.error(error);
    process.exit(0);
  }

  /**
   * Checks if the branch created by santari already exists.
   * If yes, then bail. Otherwise, continue with checking
   * further information.
   */
  santari.checkAlreadyExists(!args.dry)
    .then(() => {
      init.add(santari.getBranchDetails.bind(santari));
      init.add(santari.getPackageDetails.bind(santari));
      init.add(santari.checkForUpdates.bind(santari, args.dry));

      init.run()
        .then((upgradedJSON) => {
          if (!upgradedJSON || !Object.keys(upgradedJSON).length) {
            return cb(null, 'Nothing to update. All good :)');
          }

          /**
           * If we have passed the option --dry,
           * then bail on creation of branch and PR.
           * Just display the data.
           */
          if (args.dry) {
            return Promise.resolve(prettyPrinter(upgradedJSON));
          }

          tasks.add(santari.createBranch.bind(santari));
          tasks.add(santari.updatePackageFile.bind(santari, 'updating-deps', upgradedJSON));
          tasks.add(santari.createPR.bind(santari));

          tasks.run()
            .then((result) => {
              cb(null, {
                url: result.url,
                title: result.title,
                status: result.state,
              });
            })
            .catch((er) => {
              cb(er, null);
            });
        })
        .catch((err) => {
          cb(err, null);
        });
    })
    .catch(err => cb(err, null));
};

module.exports = run;
