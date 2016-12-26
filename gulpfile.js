const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const path = require('path');
const updateCheck = require('update-notifier');
const packageJSON = require('./package.json');
const execSync = require('child_process').execSync;

gulp.task('unit_tests', () => {
  gulp.src(path.join(__dirname, 'tests', '*.test.js'), { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 20000
    }));
});

gulp.task('lint', (done) => {
  gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('finish', () => done());
});

gulp.task('deploy', () => {
  updateCheck({
    pkg: packageJSON,
    updateCheckInterval: 0,
    callback: (err, update) => {
      if (err) {
        return err;
      }
      if (update.current !== update.latest) {
        try {
          execSync('npm publish');
        } catch (error) {
          return err;
        }
      } else {
        return console.log('Nothing to deploy.');
      }
    }
  });
});


gulp.task('default', ['lint', 'unit_tests'], () => { });
