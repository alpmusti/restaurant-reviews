/*eslint-env node*/
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var image = require('gulp-image');
var browserify = require('browserify');
var babelify = require('babelify')
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require('gulp-sourcemaps');
var watchify = require('watchify');
var merge = require('utils-merge');

gulp.task('default' , function(){
    gulp.watch('sass/**/*.scss',['styles']);
    gulp.watch('*.html').on('change' , browserSync.reload);
})

gulp.task('copy-files' , function(){
    gulp.src(['./index.html' , './restaurant.html' , 'manifest.json'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('styles' , function(){
    gulp.src('./sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error' , sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./dist/css'))        
        .pipe(browserSync.reload({stream:true}));
}); 

gulp.task('scripts:main' , function(){
    gulp.src(['./scripts/**/*.js' , '!./scripts/restaurant_info.js'])
        .pipe(babel())
        .pipe(concat('main_all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulp.dest('./js'));
});

gulp.task('scripts:sw' , function(){
    gulp.src('./sw.js')
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('scripts:restaurant' , function(){
    gulp.src(['./scripts/**/*.js' , '!./scripts/main.js'])
        .pipe(babel())
        .pipe(concat('restaurant_all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulp.dest('./js'));
});

gulp.task('imagemin', function () {
    gulp.src('./images/**/*')
        .pipe(image())
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('clean:tmp', function () {
    return del(['./tmp']);
});

gulp.task('serve' , function(){
    browserSync.init({
        server: "./",
        browser: "google chrome"
    });
});

gulp.task('idb' , function(){
    browserify({
        entries: ["./js/idb/index.js"]
    })
    .transform(babelify.configure({
        presets : ["es2015"]
    }))
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./dist/js/test"));
});

gulp.task('watchify', function () {
    var args = merge(watchify.args, { debug: true });
    var bundler = watchify(browserify('./js/idb.js', args)).transform(babelify.configure({
        presets : ["env"]
    }));
    bundle_js(bundler);
  
    bundler.on('update', function () {
      bundle_js(bundler);
    });
  })
  
  function bundle_js(bundler,dist) {
    return bundler.bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(`./js/idb`));
  }

gulp.task('dist' , ['copy-files' , 'imagemin' , 'styles' , 'idb' , 'scripts:main' , 'scripts:restaurant', 'scripts:sw' , 'clean:tmp']);

gulp.task('default' , [
    'styles' ,
    'imagemin',
    'scripts:main',
    'scripts:restaurant',
    'watchify',
    'serve' ,
    'clean:tmp'
]);
 