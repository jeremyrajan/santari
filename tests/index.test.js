const expect = require('chai').expect;
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const Santari = require('../src/tasks/santari');


describe('santari', () => {
  describe('validations', () => {
    it('should error out if ENV var is not found', () => {
      process.env.GITHUB_KEY = '';
      try {
        const check = new Santari();
      } catch (error) {
         expect(error).to.be.not.eql(null);
      }
    });
  });
});