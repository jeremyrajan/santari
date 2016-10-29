const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', (done) => {
  gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('finish', () => done());
});


gulp.task('default', ['lint'], () => { });
