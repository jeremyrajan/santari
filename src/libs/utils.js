const fs = require('fs-extra');

module.exports = {
  readConfigFile(file) {
    // we dont want to throw an error, just return null
    return fs.readJSONSync(file, { throws: false });
  }
};
