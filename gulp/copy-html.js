var gulp        = require('gulp');
var fileInclude = require('gulp-file-include');
var refresh     = require('gulp-livereload');
var preprocess  = require('gulp-preprocess');

module.exports = function () {
  return gulp.src([
    'public/src/**/*.html',
    '!public/src/partials{,/**}',
    'public/src/.htaccess',
    'public/src/crossdomain.xml',
    'public/src/humans.txt',
    'public/src/robots.txt',
    ])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(preprocess({context: { dev: true }}))
    .pipe(gulp.dest('public/dist'))
    .pipe(refresh(global.lrserver));
};
