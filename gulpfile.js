/*eslint-env node*/
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var uglifycss = require('gulp-uglifycss');
var uglify = require('gulp-uglify-es').default;
var del = require('del');
var pump = require('pump');
 
gulp.task('css', function () {
  gulp.src('./tmp/**/*.css')
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest('./css'));
});

gulp.task('js:compress', function(cb) {
    pump([
        gulp.src('./scripts/**/*.js'),
        uglify(),
        gulp.dest('./js')
    ],
    cb
  );
});

gulp.task('styles' , function(){
    gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error' , sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./tmp'))        
        .pipe(browserSync.reload({stream:true}));
}); 

gulp.task('imagemin', function () {
    gulp.src('./images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest('./img'));
});

gulp.task('clean:tmp', function () {
    return del(['./tmp'])
            .on('error' , "");
});

gulp.task('serve' , function(){
    browserSync.init({
        server: "./",
        browser: "google chrome"
    });

    gulp.watch('sass/**/*.scss',['styles']);
});

gulp.task('default' , [
    'styles' ,
    'imagemin' ,
    'css' ,
    'js:compress' ,
    'serve' ,
    'clean:tmp'
]);
 