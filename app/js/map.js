var L = require('leaflet/dist/leaflet-src');
var turf_centroid = require('turf-centroid');
var turf_polygon = require('turf-polygon');

var map = L.map('map', {
	center: [27.7460, -18.08],
	zoom: 13,
	minZoom: 4,
	maxZoom: 20,
	scrollWheelZoom: false
});

require('leaflet-hash');
var hash = new L.Hash(map);

map.on('click', function  (e) {
	console.log(e.latlng.lat+'/'+e.latlng.lng);
});

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{key}/{z}/{x}/{y}.png', {
	key: 'lrqdo.2f512fdf',
	attribution: ''
}).addTo(map);

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{key}/{z}/{x}/{y}.png', {
	key: 'lrqdo.0c289a18',
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var gpsCollection = {};
// var gpsCoords = [];

var MapWrapper = {
	initGPS: function(names, topoJsonData) {
		var colors  = ['red', 'green', 'blue'];

		for (var i = 0; i < topoJsonData.length; i++) {
			var topo = topoJsonData[i];
			var geo = topojson.feature(topo, topo.objects.stdin);
			var coords = geo.features[0].geometry.coordinates.map( coord => [coord[1], coord[0]] );
			var name = names[i];
			gpsCollection[name] = {
				polyline: L.polyline([], {color: colors[i]}).addTo(map),
				coords: coords
			};

		}
	},

	updateGPS: function (name, r, follow) {
		// console.log(name, r);
		var gps = gpsCollection[name];
		var lastCoordIndex = Math.floor(r*gps.coords.length);
		gps.polyline.setLatLngs( gps.coords.slice(0, lastCoordIndex ) );

		if (follow) {
			var meanCoords = gps.coords.slice( Math.max(0, lastCoordIndex-50), lastCoordIndex );
			meanCoords.push([ meanCoords[0][0], meanCoords[0][1] ] );
			var polygon = turf_polygon([
			  meanCoords
			]);
			var centroid = turf_centroid(polygon);
			map.panTo( centroid.geometry.coordinates, {animate: false});
		}
	},

	setView(coords) {
		console.log('setView', coords)
		map.setView( [coords[1],coords[2]], coords[0]);
	},

	map: map
};


export default MapWrapper;