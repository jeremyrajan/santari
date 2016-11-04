const fs = require('fs');

exports.first_job = {
  on: '* * * * * *',
  job: () => {
    console.log('first_job');
    fs.writeFileSync(__dirname, `tmp_${Date.now()}.txt`);
  },
  spawn: true
};
