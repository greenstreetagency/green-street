var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var refresh = require('gulp-livereload');
var rename = require('gulp-rename');
var transform = require('vinyl-transform');
var multipipe = require('multipipe');
var uglify = require('gulp-uglify');

function bundler(file) {
  var b = browserify(file, {
    extensions: ['.js'],
    debug: true,
    insertGlobalVars: true
  });

  b.require('./public/src/js/app.js', { expose: 'app' });
  b.transform(reactify);

  return b.bundle();
}

module.exports = function() {

  var scripts = [
    gulp.src('public/src/js/app.js'),
    transform(bundler),
    rename('app.js'),
    // uglify(),
    gulp.dest('public/dist/js')
  ];

  // Copy libs over as they are
  gulp.src(['public/src/js/lib/**/*'])
  .pipe(gulp.dest('public/dist/js/lib'))

  if( global.lrserver ) {
    scripts.push(refresh(global.lrserver));
  }

  var scriptsFunction = multipipe.apply(this, scripts);

  function errorHandler(e) {
    console.log('ERROR', e);
  }

  scriptsFunction.on('error', errorHandler);

  return scriptsFunction;
};
