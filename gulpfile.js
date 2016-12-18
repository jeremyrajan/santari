const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const path = require('path');

gulp.task('unit_tests', () => {
  gulp.src(path.join(__dirname, 'tests', '*.test.js'), { read: false })
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('lint', (done) => {
  gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('finish', () => done());
});


gulp.task('default', ['lint', 'unit_tests'], () => { });
