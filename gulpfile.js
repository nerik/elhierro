'use strict';

var gulp      = require('gulp'),
fs            = require('fs'),
path          = require('path'),
gulpif        = require('gulp-if'),
sass          = require('gulp-sass'),
browserify    = require('gulp-browserify'),
babelify      = require('babelify'),
browserify    = require('browserify'),
rename        = require('gulp-rename'),
browserSync   = require('browser-sync'),
buffer        = require('vinyl-buffer'),
sourcemaps    = require('gulp-sourcemaps'),
source        = require('vinyl-source-stream'),
template      = require('gulp-template'),
mergeStream   = require('merge-stream');

var config = {
    dist: './dist',
    pages: [
        {}, {}, {}, {}, {}, {}, 
        {
            slug: 'jour6-faro-de-orchilla--malpaso',
            title: 'Jour 6'
        }
    ]
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
    var mergedStreams = mergeStream();

    for (var i = 0; i < config.pages.length; i++) {
        var page = config.pages[i];

        if (!page.slug) continue;

        var content = fs.readFileSync('./app/html/'+i+'.html').toString();

        var stream = gulp.src('./app/html/index.html')
        .pipe(template({
            pageTitle: page.title,
            content: content
        }))
        .pipe(gulp.dest( path.join( config.dist, page.slug ) ) );

        mergedStreams.add(stream);
    };


    return mergedStreams;
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

    gulp.watch(config.dist+"/**/*.js").on('change', browserSync.reload);
});
