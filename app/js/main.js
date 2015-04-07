var L = require('leaflet/dist/leaflet-src');

var map = L.map('map', {
	center: [-18.766947, 49],
	zoom: 6,
	minZoom: 4,
	maxZoom: 10
});

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{key}/{z}/{x}/{y}.png', {
	key: 'lrqdo.2c2d7d96',
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);