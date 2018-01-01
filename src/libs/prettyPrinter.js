const prettyJson = require('prettyjson');
const boxen = require('boxen');

module.exports = (data) => {
  console.log('\n');
  console.log(boxen(`Following are the latest versions for installed NPM packages:\n\n ${prettyJson.render(data)}`, {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'green'
  }));
};
