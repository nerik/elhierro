#!/usr/bin/env node

//node scripts/geocodePhotos.js --imgSrc raw/photos/3/photo --gpxSrc raw/gpx_corrected/3 --timeOffset TOMTOM > dist/data/3/photos.json
//will output to stdout

var argv = require('yargs').argv;
var fs = require('fs');	
var path = require('path');
var _ = require('underscore');
var xml2js = require('xml2js');
var moment = require('moment');


var imageSourcePath = argv.imgSrc;
var gpxSourcePath = argv.gpxSrc;

//time offsets in ms
var TIME_OFFSETS = {
	'TOMTOM' : -3600000
};
var timeOffset = TIME_OFFSETS[argv.timeOffset];

/*
list image files
order them by date
list gpx files
order gpx points by date
for each image
	get closest gpx point
*/

var images = fs.readdirSync(imageSourcePath);
images.sort( function (fileA, fileB) {
	// console.log( fs.statSync( path.join(imageSourcePath, fileA) ).mtime.getTime())
	return fs.statSync( path.join(imageSourcePath, fileA) ).mtime.getTime() - fs.statSync( path.join(imageSourcePath , fileB) ).mtime.getTime();
});

//remove non images
images = _.reject (images, function (f) {
	return f.search(/\.jpg$/i) === -1;
});


//collect ll GPX points
var gpxPoints = [];
var gpxFiles = fs.readdirSync(gpxSourcePath);

for (var i = 0; i < gpxFiles.length; i++) {
	var gpxPath = gpxFiles[i];
	var gpx = fs.readFileSync( path.join(gpxSourcePath, gpxPath) );
	xml2js.parseString(gpx, readGPX);
}

function readGPX (err, result) {
	var trks = result.gpx.trk;

	trks.forEach( function (trk) {
		
		var trksegs = trk.trkseg;

		trksegs.forEach( function (trkseg) {

			var trkpts = trkseg.trkpt;

			trkpts.forEach( function (trkpt) {
				if (!trkpt.time || !trkpt.time.length) {
					// console.warn('no time on this trkpt:');
					// console.warn(trkpt);
				} else {
					var m = moment(trkpt.time[0]);
					// console.log ( m.format('x') );
					gpxPoints.push( [
						[trkpt.$.lat, trkpt.$.lon],
						parseInt(m.format('x'))
					] );
				}
			});
		});
	});
}

//sort them by timestamp
gpxPoints.sort(function (ptA, ptB) {
	return ptA[1]-ptB[1];
});



//go through each images

var currentGpxPoint = 0;
var finalData = [];
var geocodedImages = [];

images.forEach( function (imagePath) {
	var imgDate = fs.statSync( path.join(imageSourcePath, imagePath) ).mtime.getTime();
	imgDate += timeOffset;

	var d = {
		n: imagePath,
		t: imgDate,
		tf: moment(imgDate).format("dddd, MMMM Do YYYY, h:mm:ss a")
	};

	finalData.push(d);

	for (var i = currentGpxPoint; i < gpxPoints.length; i++) {
		var pt = gpxPoints[i];

		if (pt[1] >= imgDate) {
				
			d.c = pt[0];

			currentGpxPoint = i;

			geocodedImages.push(imagePath);

			break;
		}
	}
});
process.stdout.write(JSON.stringify(finalData));

// var nonGeocodedImages = _.difference(images, geocodedImages);

// nonGeocodedImages.forEach( function (imagePath) {
// 	finalData.push({

// 	});
// });

// function function_name (argument) {
// 	// body...
// }
