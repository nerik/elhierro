var L = require('leaflet/dist/leaflet-src');



var map = L.map('map', {
	center: [27.7460, -18.08],
	zoom: 13,
	minZoom: 4,
	maxZoom: 20,
	scrollWheelZoom: false
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

	updateGPS: function (name, r) {
		// console.log(name, r);
		var gps = gpsCollection[name];
		gps.polyline.setLatLngs( gps.coords.slice(0, Math.floor(r*gps.coords.length) ) );

	},

	map: map
};


export default MapWrapper;