const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const image = require('gulp-image');
const htmlmin = require('gulp-htmlmin');

gulp.task('styles' , () => {
  return gulp.src(['./sass/**/main.scss' , './sass/**/restaurant.scss'])
  .pipe(sass({outputStyle: 'compressed'}).on('error' , sass.logError))
  .pipe(gulp.dest('./css'))
  .pipe(gulp.dest('./dist/css'))
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
  .pipe(sourcemaps.write('maps')) // You need this if you want to continue using the stream with other plugins
  .pipe(gulp.dest('./dist/js'))    
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
    .pipe(gulp.dest('./dist/js'))
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

gulp.task('prod' , function(){
  browserSync.init({
    server: './dist',
    browser: 'google chrome'
  });
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

gulp.task('minify', function() {
  return gulp.src('./src/**.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./'));
});

gulp.task('build' , ['imagemin' , 'styles' , 'scripts:main' , 'scripts:restaurant', 'minify' , 'copy-files']);
gulp.task('default' , ['imagemin' , 'scripts:main', 'scripts:restaurant' , 'watch' , 'minify' , 'serve']);