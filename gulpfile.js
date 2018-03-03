var gulp = require('gulp'),
 connect = require('gulp-connect');
var babel = require("gulp-babel");

gulp.task('connect', function() {
  connect.server({
    port: 8080
  });
});

gulp.task('default', ['connect']);