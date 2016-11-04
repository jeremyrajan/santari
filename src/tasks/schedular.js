const cronjob = require('node-cron-job');
const fs = require('fs');
const path = require('path');

const PID_TXT_PATH = path.join(__dirname, '..', 'pids.txt');
cronjob.setJobsPath(path.join(__dirname, 'job.js'));

const checkPIDFile = () => {
  try {
    return fs.statSync(PID_TXT_PATH);
  } catch (ex) { } // eslint-disable-line
  return false;
};

module.exports = {
  init() {
    if (!checkPIDFile()) {
      fs.writeFileSync(PID_TXT_PATH, '');
    }

    const job = cronjob.startJob('first_job');

    console.log(job);

    fs.writeFileSync(PID_TXT_PATH, `\n{job}`);
  }
};
