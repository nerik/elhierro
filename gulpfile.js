'use strict';

var gulp      = require('gulp'),
gulpif        = require('gulp-if'),
sass          = require('gulp-sass'),
browserify    = require('gulp-browserify'),
babelify      = require('babelify'),
browserify    = require('browserify'),
rename        = require('gulp-rename'),
browserSync   = require('browser-sync'),
buffer = require('vinyl-buffer'),
sourcemaps = require('gulp-sourcemaps'),
source        = require('vinyl-source-stream');

var config = {
    dist: './dist'
};


gulp.task('js', function() {
    return browserify({
        entries: './app/js/main.js',
        debug: true,
        transform: [babelify]
    })
    .bundle()
    .pipe(source('./app/js/main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        // .pipe(uglify())
        // .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('sass', ['cssToSass'], function () {
    return gulp.src('./app/styles/main.scss')
        .pipe(sass({
            includePaths: ['./app/styles/'],
            sourceComments: null,
            sourceMap: null
        }))
        .pipe(rename('main.css'))
        .pipe(gulp.dest(config.dist));
});


gulp.task('cssToSass', function () {
    return gulp.src('./node_modules/leaflet/dist/leaflet.css')
        .pipe(rename("_leaflet.scss"))
        .pipe(gulp.dest('./app/styles/'));
});

gulp.task('html', function(){
    return gulp.src('./app/index.html')
        .pipe(gulp.dest(config.dist));
});

gulp.task('data', function(){
    return gulp.src('./app/data/**/*')
        .pipe(gulp.dest(config.dist+'/data'));
});

gulp.task('build', ['sass','js','html', 'data'], function () {

});

gulp.task('serve', ['build'], function() {

    browserSync({
        server: {
            baseDir: config.dist,
        },
        open   : false,
        port   : 7777
    });

    gulp.watch("app/styles/**/*.scss", ['sass']);
    gulp.watch("app/js/**/*.js", ['js']);
    gulp.watch("app/**/*.html", ['html']);
    gulp.watch("app/data/*", ['data']);

    gulp.watch(config.dist+"/**/*").on('change', browserSync.reload);
});
