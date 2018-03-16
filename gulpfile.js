var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var image = require('gulp-image');

gulp.task('styles' , () => {
  return gulp.src('./sass/**/*.scss')
  .pipe(sass({outputStyle: 'compressed'}).on('error' , sass.logError))
  .pipe(gulp.dest('./css'))
  .pipe(browserSync.stream());
});

gulp.task('scripts:main', () => {
  browserify(['scripts/main.js' ,  'scripts/dbhelper.js' , 'scripts/app.js' , './sw.js' ])
  .transform(babelify.configure({
    presets: ['env']
  }))
  .bundle()
  .pipe(source('main_bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(sourcemaps.write('maps'))    // You need this if you want to continue using the stream with other plugins
  .pipe(gulp.dest('./js'));
});

gulp.task('scripts:restaurant', () => {
    browserify(['scripts/restaurant_info.js' , 'scripts/dbhelper.js' , 'scripts/app.js' , './sw.js'])
    .transform(babelify.configure({
      presets: ['env']
    }))
    .bundle()
    .pipe(source('restaurant_bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))    // You need this if you want to continue using the stream with other plugins
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('./js'));
  });

gulp.task('watch' , () => {
  gulp.watch(['./sw.js' , './scripts/**/*.js'] , ['scripts:main' , 'scripts:restaurant']);
});

gulp.task('serve', ['styles'] , () => {
  browserSync.init({
    server: './',
    browser: 'google chrome'
  });

  gulp.watch('./sass/**/*.scss' , ['styles']);
  gulp.watch('./**/**.html').on('change' , browserSync.reload);
});

gulp.task('copy-files' , function(){
    gulp.src(['./index.html' , './restaurant.html' , 'manifest.json'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('imagemin', function () {
    gulp.src('./images/**/*.*')
        .pipe(image())
        .pipe(gulp.dest('./dist/img'))
        .pipe(gulp.dest('./img'));
});

gulp.task('dist' , ['copy-files' , 'imagemin' , 'styles' , 'scripts:main' , 'scripts:restaurant']);
gulp.task('default' , ['imagemin' , 'scripts:main', 'scripts:restaurant' , 'watch' , 'serve']);