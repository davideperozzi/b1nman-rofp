const gulp = require('gulp');
const closure = require('dj-gulp-tasks/closure');

/** JavaScript tasks */
closure.deps({
    'prefix': '../../../../',
    'output': './javascript/gen/application.deps.js',
    'files': [
        './javascript/src/**/*.js',
        './node_modules/dj-library/**/*.js'
    ]
});

closure.compile({
    'output': './javascript/dist/application.min.js',
    'files': [
        './javascript/src/**/*.js',
        './node_modules/google-closure-library/closure/goog/**/*.js',
        './node_modules/dj-library/**/*.js'
    ],
    'config': {
        'compilation_level': 'WHITESPACE_ONLY',
        'warning_level': 'VERBOSE',
        'closure_entry_point': 'rofp.bootstrap'
    }
});

gulp.task('watch', ['dj-closure-deps-watch']);
gulp.task('build', ['dj-closure-compile']);
gulp.task('default', ['watch']);