const fs = require('fs');

module.exports = {
  /**
   * File write. Used to write the new package.json to temp
   * directory.
   */
  writePackageJson: (content, fileName) => {
    fs.writeFileSync(fileName, Buffer.from(content, 'base64').toString());
  }
};
