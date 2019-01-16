const fs = require('fs-extra');
const path = require('path');
const gitUrl = require('parse-github-url');

module.exports = {
  readConfigFile(file) {
    // try to load package.json from execution context directory
    const pkg = fs.readJSONSync(path.join(process.cwd(), 'package.json'), { throws: false });
    let host, repo;

    if (pkg) {
      const pkgRepo = pkg.repository.url || pkg.repository;
      const pkgGit = gitUrl(pkgRepo);
      host = `${pkgGit.host}/api/v3`;
      repo = pkgGit.repo;
    }

    // we dont want to throw an error, just return null
    if (!file) file = path.join(process.cwd(), '.santari.json');
    const config = fs.readJSONSync(file, { throws: false });
    if (config) {
      // assign host and repo from package.json if they exist
      Object.assign(config, host && { host }, repo && { repo });
    }
    return config;
  }
};
