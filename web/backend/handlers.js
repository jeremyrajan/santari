const cron = require('crontab');

let cronTab; // localValue to save

const loadCronTab = () => {
  return new Promise((resolve, reject) => {
    if (cronTab) {
      return resolve(cronTab);
    }
    cron.load((err, crontab) => {
      if (err) {
        return reject(err);
      }
      cronTab = crontab;
      resolve(crontab);
    });
  });
};

const saveCronTab = () => {
  return new Promise((resolve, reject) => {
    cronTab.save((err, crontab) => {
      if (err) {
        return reject(err);
      }
      cronTab = crontab;
      resolve('ok');
    });
  });
};


module.exports = {
  getJobs() {
    return loadCronTab()
      .then((crontab) => {
        return crontab.jobs().toString();
      })
      .catch((err) => {
        return err;
      });
  },

  createJob(cmd, interval) {
    return loadCronTab()
      .then((crontab) => {
        crontab.create(cmd, interval);
        return saveCronTab();
      })
      .then((res) => {
        if (res === 'ok') {
          return true;
        }
        throw res;
      })
      .catch((err) => {
        return err;
      });
  }
};
