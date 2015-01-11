var map = L.map('map').setView([46.3073,1.7235], 13);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/lrqdo.50ce49e8/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

var track = new L.GPX("gpx/test.gpx", {async: true})
			.on("loaded", function(e) { console.log('pou');map.fitBounds(e.target.getBounds()); });

			map.addLayer(track);