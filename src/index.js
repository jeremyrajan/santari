const Santari = require('./tasks/santari');
const PromiseSeries = require('promise-series');
const logger = require('./libs/logger');

// init series promises.
const init = new PromiseSeries();
const tasks = new PromiseSeries();

const run = (repo, cb) => {
  let santari;

  // try catch :)
  try {
    santari = new Santari(repo);
  } catch (error) {
    logger.error(error);
    process.exit(0);
  }

  /**
   * Checks if the branch created by santari already exists.
   * If yes, then bail. Otherwise, continue with checking
   * further information.
   */
  santari.checkAlreadyExists()
    .then(() => {
      init.add(santari.getBranchDetails.bind(santari));
      init.add(santari.getPackageDetails.bind(santari));
      init.add(santari.checkForUpdates.bind(santari));

      init.run()
        .then((upgradedJSON) => {
          if (!upgradedJSON) {
            return cb(null, 'Nothing to update. All good :)');
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
