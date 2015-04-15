#!/usr/bin/env node

var argv = require('yargs').argv;
var moment = require('moment');

var rawGeoJSON = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
	
	rawGeoJSON += data;
});
process.stdin.on('end', function() {
  prepareGeoJSON();
});

function prepareGeoJSON() {
	var g = JSON.parse(rawGeoJSON);

	//make time display more compact
	g.features[0].properties.coordTimes = g.features[0].properties.coordTimes.map( function(time) {
		var t = moment(time);
		return t.format('H:mm');
	});

	//move altitudes to a separate array, because topojson doesnt seem to keep them properly
	var altitudes = [];
	var coordinates = g.features[0].geometry.coordinates;
	coordinates.forEach( function(coords, i) {
		// console.log(i);
		// console.log(coordinates[i]);
		var alt = coordinates[i].splice(2,1);
		alt = alt[0];
		altitudes.push(alt);
	});

	g.features[0].properties.altitudes = altitudes;

	process.stdout.write(JSON.stringify(g));
}

