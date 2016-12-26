const github = require('octonode');
const osTmpdir = require('os-tmpdir')();
const semver = require('semver');
const path = require('path');
const uuid = require('../libs/uuid');
const packageLib = require('./package');
const ncu = require('npm-check-updates');
const deepEqual = require('deep-equal');
const fs = require('fs');

/**
 * The base case for Santari, which perform various
 * ops such as checking for santari branches, updates,
 * writing new package files, creating a branch, and
 * creating a PR.
 */
module.exports = class Santari {
  constructor(args) {
    this.accessKey = process.env.GITHUB_KEY;

    // If we dont have the accessKey then bail!
    if (!this.accessKey) {
      throw new Error('Github access token environment variable does not exist! Please create one at GITHUB_KEY');
    }

    this.client = github.client(this.accessKey);
    this.repoDetails = this.client.repo(args.repo);
    this.masterSHA = ''; // master SHA
    this.packageSHA = ''; // package JSON SHA
    this.packagePath = ''; // package path from repo
    this.packageJSON = ''; // JSON parsed version of repo package
    this.packageTempPath = ''; // package path where temp package is stored. To be used by ncu
    this.depBranchName = `update-deps-santari-${Math.ceil(Math.random() * 100000)}`;
    this.mainBranch = 'master';
    this.prOpts = {
      title: 'Updating Dependencies',
      body: 'Dependencies to Update',
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
  getBranchDetails(branchName = 'master') {
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

      this.repoDetails.updateContents(this.packagePath,
        commitMessage,
        JSON.stringify(content, null, 2),
        this.packageSHA,
        this.depBranchName, (err, result) => {
          if (err) {
            return reject(err);
          }

          return resolve(result);
        });
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
