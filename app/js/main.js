var L = require('leaflet/dist/leaflet-src');

var map = L.map('map', {
	center: [27.7460, -18.0299],
	zoom: 12,
	minZoom: 4,
	maxZoom: 20,
	scrollWheelZoom: false
});

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{key}/{z}/{x}/{y}.png', {
	key: 'lrqdo.0c289a18',
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);