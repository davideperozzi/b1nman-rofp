const gulp = require('gulp');
const rename = require('gulp-rename');

const depsConfig = {
  'closurePath': './node_modules/google-closure-library/closure/goog',
  'output': './javascript/gen/application.deps.js',
  'files': [
    './javascript/src/**/*.js',
    './node_modules/dj-library/**/*.js'
  ]
};

gulp.task('deps', () => {
  const closureDeps = require('./deps');

  var outputParts = depsConfig.output.split('/');
  var fileName = outputParts.pop();
  var outputPath = outputParts.join('/');

  return gulp.src(depsConfig.files)
    .pipe(closureDeps({ 'closurePath': depsConfig.closurePath }))
    .pipe(rename(fileName))
    .pipe(gulp.dest(outputPath))
    .on('end', () => {
      delete require.cache[require.resolve('./deps')];
    });
})