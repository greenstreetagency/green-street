var gulp = require('gulp');

module.exports = function () {
  gulp.src('public/src/**/*.php')
    .pipe(gulp.dest('public/dist/'));
};
