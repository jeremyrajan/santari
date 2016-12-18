const expect = require('chai').expect;
const Santari = require('../src/tasks/santari');
const path = require('path');

describe('santari', () => {
  describe('validations', () => {
    it('should error out if ENV var is not found', () => {
      process.env.GITHUB_KEY = '';
      try {
        new Santari(); // eslint-disable-line
      } catch (error) {
        expect(error).to.be.not.eql(null);
      }
    });
  });
});

describe('processing', () => {
  it('should not override locked versions', () => {
    process.env.GITHUB_KEY = process.env.GITHUB_KEY_BAK; // on CI env var.
    const check = new Santari('jeremyrajan/santari');
    check.packageTempPath = path.join(__dirname, 'mock.json');
    check.packageJSON = require('./mock.json'); // eslint-disable-line
    return check.checkForUpdates()
      .then((res) => {
        expect(res.dependencies.cucumber).to.be.eql('1.3.1');
        expect(res.dependencies.eslint).to.be.not.eql('3.11.1');
      });
  });
});
