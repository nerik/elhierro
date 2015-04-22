'use strict';

var gulp      = require('gulp'),
fs            = require('fs'),
path          = require('path'),
exec          = require('child_process').exec,
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
_             = require('underscore'),
mergeStream   = require('merge-stream');

var config = {
    dist: './dist',
    debug: true,
    pages: [
        {}, 
        {}, 
        {}, 
        {
            slug: 'jour3-risco-de-los-herrenos-las-playas--isora',
            title: 'Jour 3',
            gps: [
                { n: '0_car' },
                { n: '1_feet', props: 'coordTimes,altitudes' },
                { n: '2_taxi' }
            ]
        },
        {}, 
        {}, 
        {
            slug: 'jour6-faro-de-orchilla--malpaso',
            title: 'Jour 6'
        },
        {}
    ]
};

gulp.task('topojson', function () {
    for (var i = 0; i < config.pages.length; i++) {
        var page = config.pages[i];

        if (!page.gps) continue;

        for (var j = 0; j < page.gps.length; j++) {
            var gps = page.gps[j];

            var topoJsonProps = (gps.props) ? '-p '+ gps.props : '';

            var pipes = [
                'togeojson raw/gpx_corrected/'+i+'/'+gps.n + '.gpx',
                './scripts/geojson.js',
                'topojson -q 1e5 ' + topoJsonProps           
            ];

            var dest = path.join('./dist/data', ''+i, gps.n + '.topojson' );

            var cmd = pipes.join(' | ') + ' > ' + dest;

            console.log(cmd); 

            exec ( cmd );

        }
    }
    
});

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

    for (var pageIndex = 0; pageIndex < config.pages.length; pageIndex++) {
        var page = config.pages[pageIndex];

        if (!page.slug) continue;

        var content = fs.readFileSync('./app/html/'+pageIndex+'.html').toString();

        content = injectGeocodedMetas(content, pageIndex);

        var slug = (config.debug) ? pageIndex : page.slug;

        var stream = gulp.src('./app/html/layout.html')
        .pipe(template({
            pageTitle: page.title,
            content: content
        }, { evaluate: '' } ))
        .pipe(rename(slug+'.html'))
        .pipe(gulp.dest( config.dist ) );

        mergedStreams.add(stream);
    }


    return mergedStreams;
});

gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe( gulp.dest(config.dist+'/fonts') );
});

gulp.task('illu', function() {
    var mergedStreams = mergeStream();

    for (var pageIndex = 0; pageIndex < config.pages.length; pageIndex++) {
        var stream = gulp.src('app/data/'+pageIndex+'/illu/**/*')
            .pipe( gulp.dest(config.dist+'/data/'+pageIndex+'/illu') );

        mergedStreams.add(stream);
    }
    return mergedStreams;

});

gulp.task('build', ['sass','js','html', 'fonts', 'illu'], function () {

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
    gulp.watch("app/html/**/*.html", ['html']);

    gulp.watch(config.dist+"/**/*.{js,html,css}").on('change', browserSync.reload);
});

//use geocoded_photos.json to generate img tags with coordinates in the html.
//geocoded_photos.json has been generated with scripts/geocodePhotos.json
function injectGeocodedMetas (content, pageIndex) {
    
    var geocodedImagesRegex = /<!-- GeocodedImages (.+) EndGeocodedImages -->/gi;
    var geocodedImages = geocodedImagesRegex.exec(content);

    if (geocodedImages) {
        geocodedImages = geocodedImages[1].split(' ');
        var geocodedMetas = JSON.parse( fs.readFileSync('./app/data/'+pageIndex+'/geocoded_photos.json').toString() );

        var geocodedImagesHtml = [];

        geocodedImages.forEach(function (img) {
            var geocodedMeta = _.where(geocodedMetas, {n: img});
            if (!geocodedMeta || !geocodedMeta.length) {
                console.log('No geocoded meta found for ' + img);
            } else {
                var imgHtml = '<img src="data/'+pageIndex+'/img/medium/'+img+'" data-coords="'+ geocodedMeta[0].c +'">';
                geocodedImagesHtml.push(imgHtml);
            }
        });

        geocodedImagesHtml = geocodedImagesHtml.join('\n');

        content = content.replace(geocodedImagesRegex, geocodedImagesHtml);
    }

    return content;


}
