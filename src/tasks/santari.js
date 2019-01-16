const github = require('octonode');
const osTmpdir = require('os-tmpdir')();
const semver = require('semver');
const path = require('path');
const ncu = require('npm-check-updates');
const deepEqual = require('deep-equal');
const fs = require('fs');
const transform = require('lodash.transform');
const uuid = require('../libs/uuid');
const packageLib = require('./package');
const utils = require('../libs/utils');
const logger = require('../libs/logger');

/**
 * The base case for Santari, which perform various
 * ops such as checking for santari branches, updates,
 * writing new package files, creating a branch, and
 * creating a PR.
 */
module.exports = class Santari {
  constructor(args) {
    // read the config file if passed
    const config = { pr: {}, token: process.env.GITHUB_KEY, msg: undefined };
    const file = utils.readConfigFile(args.config);
    if (file) {
      Object.assign(config, file);
    }
    // merge arguments into config, overriding any file definitions
    Object.assign(config, args);
    // If we haven't managed to populate the repo, then bail!
    if (!config.repo) {
      throw new Error('Repository not available from package.json or command line --repo arg');
    }
    // If we dont have the accessKey then bail!
    if (!config.token) {
      throw new Error('Github access token was not defined. Please supply environment variable GITHUB_KEY or specify --token, -t prop');
    }

    logger.info(`repository :: ${config.repo}`);
    this.client = config.host
      ? github.client(config.token, { hostname: config.host }) : github.client(config.token);
    this.repoDetails = this.client.repo(config.repo);
    this.masterSHA = ''; // master SHA
    this.packageSHA = ''; // package JSON SHA
    this.packagePath = ''; // package path from repo
    this.packageJSON = ''; // JSON parsed version of repo package
    this.packageTempPath = ''; // package path where temp package is stored. To be used by ncu
    this.depBranchName = `update-deps-santari-${Math.ceil(Math.random() * 100000)}`;
    this.mainBranch = config.branch || 'master';
    this.commitMsg = config.msg || 'chore(package.json): update dependencies\n';
    this.prOpts = {
      title: config.pr.title || 'santari: updating dependencies',
      body: config.pr.body || '',
      head: this.depBranchName,
      base: this.mainBranch
    };
  }

  /**
   * Check if we already have a branch with sanatri in them
   * We dont want to create and check, if there is already a
   * active branch.
   */
  checkAlreadyExists(check = true) { // if we pass check as false, then override.
    if (!check) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      this.repoDetails.branches((err, branches) => {
        if (err) {
          return reject(err);
        }
        if (branches.filter(f => f.name.includes('update-deps-santari')).length > 0) {
          return reject('PR/Branch is already created and active!');
        }
        resolve(true);
      });
    });
  }

  /**
   * Gets branch details, mainly used to get the
   * latest commit SHA.
   */
  getBranchDetails(branchName = this.mainBranch) {
    return new Promise((resolve, reject) => {
      this.repoDetails.branch(branchName, (err, result) => {
        if (err) {
          return reject(err);
        }

        this.mainBranch = branchName;
        this.masterSHA = result.commit.sha;
        resolve(result);
      });
    });
  }

  /**
   * Gets the package.json, for version checking.
   */
  getPackageDetails() {
    return new Promise((resolve, reject) => {
      this.repoDetails.contents('package.json', (err, result) => {
        if (err) {
          return reject(err);
        }
        this.packageSHA = result.sha;
        this.packagePath = result.path;
        this.packageJSON = JSON.parse(Buffer.from(result.content, 'base64').toString());
        this.writePackageToTemp(result.content);
        resolve(result);
      });
    });
  }

  /**
   * Writes the new package JSON file in a temporary
   * directory. This is later deleted!
   */
  writePackageToTemp(content) {
    const tempId = uuid();
    const packagePath = path.join(osTmpdir, `package_${tempId}.json`);
    packageLib.writePackageJson(content, packagePath);
    this.packageTempPath = packagePath;
  }

  /**
   * creates a PR/commit message including the updated dependencies
   */
  createPRBody(newDep, dep, newDevDep, devDep) {
    let body = '';

    const diffDeps = transform(newDep, (result, value, key) => Object.assign(result, dep[key] !== newDep[key] && { [key]: value }));
    const diffDevDeps = transform(newDevDep, (result, value, key) => Object.assign(result, devDep[key] !== newDevDep[key] && { [key]: value }));

    if (Object.keys(diffDeps).length) {
      body += 'Prod dependencies updated:\n';
      Object.keys(diffDeps).forEach((key) => {
        body += `* \`${key} : ${dep[key]} -> ${newDep[key]}\`\n`;
      });
    }

    if (Object.keys(diffDevDeps).length) {
      body += '\nDev dependencies updated:\n';
      Object.keys(diffDevDeps).forEach((key) => {
        body += `* \`${key} : ${devDep[key]} -> ${newDevDep[key]}\`\n`;
      });
    }
    this.prOpts.body = this.prOpts.body || body;
    this.commitMsg = this.commitMsg + body || body;
  }

  /**
   * Validates the new package.json, if we need to upgrade
   * so that we dont override certains things.
   * For eg: Locked versions.
   */
  validatePackageJson(packageJSON) {
    const { dependencies, devDependencies } = packageJSON;
    const newDeps = {};
    const newDevDeps = {};

    if (!dependencies || !devDependencies) {
      return packageJSON;
    }

    // for dependencies
    for (const depName of Object.keys(dependencies)) { // eslint-disable-line
      if (isNaN(parseFloat(dependencies[depName]))) {
        newDeps[depName] = dependencies[depName];
      } else {
        newDeps[depName] = this.packageJSON.dependencies[depName];
      }
    }

    // for devDependencies
    for (const depName of Object.keys(devDependencies)) { // eslint-disable-line
      if (isNaN(parseFloat(devDependencies[depName]))) {
        newDevDeps[depName] = devDependencies[depName];
      } else {
        newDevDeps[depName] = this.packageJSON.devDependencies[depName];
      }
    }
    this.createPRBody(newDeps, this.packageJSON.dependencies, newDevDeps, this.packageJSON.devDependencies);

    packageJSON.dependencies = newDeps; // eslint-disable-line
    packageJSON.devDependencies = newDevDeps; // eslint-disable-line
    return packageJSON;
  }

  /**
   * This is where we run `ncu` to get the updated
   * package JSON information.
   */
  checkForUpdates(dry = false) {
    // easier implementation for us to get
    // updated deps instead of whole package.
    return new Promise((resolve, reject) => {
      ncu.run({
        packageFile: this.packageTempPath,
        silent: true,
        jsonUpgraded: true,
        jsonAll: !dry,
        loglevel: 'silent'
      })
        .then((newPackageJSON) => {
          if (deepEqual(newPackageJSON, this.packageJSON)) {
            return resolve(null); // nothing to update
          }
          resolve(this.validatePackageJson(newPackageJSON));
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Creates a new Branch, where the updated package json
   * is uploaded.
   */
  createBranch() {
    return new Promise((resolve, reject) => {
      if (!this.masterSHA) {
        return reject('SHA is invalid.');
      }
      this.repoDetails.createReference(this.depBranchName, this.masterSHA, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  /**
   * Updates the package file.
   */
  updatePackageFile(commitMessage, content) {
    return new Promise((resolve, reject) => {
      if (!this.packageSHA || !this.packagePath) {
        return reject('Package SHA/Path is invalid');
      }

      // update the minor version
      content.version = semver.inc(content.version, 'patch'); // eslint-disable-line

      this.repoDetails.updateContents(
        this.packagePath,
        this.commitMsg,
        JSON.stringify(content, null, 2),
        this.packageSHA,
        this.depBranchName, (err, result) => {
          if (err) {
            return reject(err);
          }

          return resolve(result);
        }
      );
    });
  }

  /**
   * Deletes the temporary package.json
   * that was created.
   */
  deletePackageTemp() {
    try {
      fs.unlinkSync(this.packageTempPath);
    } catch (e) {
      return e;
    }
  }

  /**
   * Creates a PR with the updated package.json
   * information.
   */
  createPR() {
    return new Promise((resolve, reject) => {
      this.repoDetails.pr(this.prOpts, (err, result) => {
        if (err) {
          return reject(err);
        }

        const deleteResult = this.deletePackageTemp();
        if (!deleteResult) { // if delete returns undefined, we should be good :)
          return resolve(result);
        }

        reject(deleteResult); // if error is passed back
      });
    });
  }
};
