const crypto = require('crypto');

module.exports = () => {
  const id = crypto.randomBytes(16).toString('hex');
  return id;
};
