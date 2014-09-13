var gulp = require('gulp');
var browserify = require('browserify');
var del = require('del');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var minifyCSS = require('gulp-minify-css');
var express = require('express');
var serverport = 5000;

var paths = {
  css: ['src/css/**/*.css'],
  app_js: ['./src/js/app.jsx'],
  js: ['src/js/**/*.jsx'],
  html: ['src/views/*.html'],
  build: './build/'
};

var server = express();
server.use(express.static(paths.build));

gulp.task('cleanJS', function(done) {
  del(['build/**/*.js'], done);
});

gulp.task('cleanHTML', function(done) {
  del(['build/**/*.html'], done);
});

gulp.task('cleanCSS', function(done) {
  del(['build/**/*.css'], done);
});

gulp.task('clean', ['cleanJS', 'cleanHTML', 'cleanCSS']);

gulp.task('css', ['cleanCSS'], function() {
  gulp.src(paths.css)
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest(paths.build))
});

gulp.task('js', ['cleanJS'], function() {
  browserify(paths.app_js, {
      debug: true,
      extensions: ['.jsx', '.js']})
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(paths.build));
});

gulp.task('html', ['cleanHTML'], function(){
  gulp.src(paths.html)
    .pipe(gulp.dest(paths.build));
});

gulp.task('build', ['html', 'js', 'css']);

gulp.task('serve', function() {
  server.listen(serverport);
});


gulp.task('watch', function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('default', ['build', 'serve', 'watch']);
