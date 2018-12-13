const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const path = require('path');
const { execSync } = require('child_process');
const updateCheck = require('update-notifier');
const packageJSON = require('./package.json');

gulp.task('unit_tests', () => {
  return gulp.src(path.join(__dirname, 'tests', '*.test.js'), { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 20000
    }));
});

gulp.task('lint', (done) => {
  return gulp.src(['src/**/*.js'])
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

gulp.task('default', gulp.series(['lint', 'unit_tests']));
