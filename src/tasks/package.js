const fs = require('fs');

module.exports = {
  writePackageJson: (content, fileName) => {
    fs.writeFileSync(fileName, Buffer.from(content, 'base64').toString());
  }
};
