var gulp = require('gulp');

module.exports = function () {
  gulp.src('public/src/fonts/**/*')
    .pipe(gulp.dest('public/dist/fonts'));

  gulp.src('public/src/img/**/*')
    .pipe(gulp.dest('public/dist/img'));
};