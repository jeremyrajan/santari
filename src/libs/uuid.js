const crypto = require('crypto');

// uuid generator for creating unique branch names.
module.exports = () => {
  const id = crypto.randomBytes(16).toString('hex');
  return id;
};
