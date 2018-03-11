/*eslint-env node*/
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var pngquant = require('imagemin-pngquant');
var image = require('gulp-image');

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
        .pipe(concat('main_all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
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
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('imagemin', function () {
    gulp.src('./images/**/*')
        .pipe(image())
        // .pipe(imagemin([
        //     imagemin.gifsicle({interlaced: true}),
        //     imagemin.jpegtran({progressive: true}),
        //     imagemin.optipng({optimizationLevel: 5}),
        //     imagemin.svgo({
        //         plugins: [
        //             {removeViewBox: true},
        //             {cleanupIDs: false}
        //         ]
        //     })
        // ]))
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

gulp.task('dist' , ['copy-files' , 'imagemin' , 'styles' , 'scripts:main' , 'scripts:restaurant', 'scripts:sw' , 'clean:tmp']);

gulp.task('default' , [
    'styles' ,
    'imagemin' ,
    'scripts:main',
    'scripts:restaurant',
    'serve' ,
    'clean:tmp'
]);
 