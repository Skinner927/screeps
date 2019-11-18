var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var screeps = require('gulp-screeps');
var credentials = require('./credentials.js');

var srcJS = 'src/*.js';

function upload() {
  return gulp.src(srcJS)
    .pipe(screeps(credentials))
}

function watchDir() {
  return watch(srcJS, { ignoreInitial: false }, batch(function(events, done) {
    upload().on('finish', done);
  }));
}

exports.default = upload;
exports.upload = upload;
exports.watch = watchDir;
