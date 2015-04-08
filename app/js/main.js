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


var getXHRPromise = function(url) {
	return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.onload = e => {
            if ( e.target.status !== 200) {
                reject(e.target.statusText);
            } else {
                resolve(JSON.parse(e.target.response));
            }
        };

        request.onerror = e => {
            reject(e.target.statusText);
        };
        request.open('GET', url);
        request.send();
    });
};

getXHRPromise('./data/2/01_feet.json').then( data => {
	console.log(data.features[0]);

	var geojsonFeature = {
	    "type": "Feature",
	    "properties": {
	        "name": "Coors Field",
	        "amenity": "Baseball Stadium",
	        "popupContent": "This is where the Rockies play!"
	    },
	    "geometry": {
	        "type": "Point",
	        "coordinates": [27.7460, -18.0299]
	    }
	};
	var myLines = [{
	    "type": "LineString",
	    "coordinates": [[27.7460, -18.0299], [27.7460, -19.0299], [28.7460, -18.0299]]
	}];

	L.geoJson(data.features[0] , {
		style: function (feature) {
			return {color: '#FF0000', opacity: 1, dasharray: [5, 5] };
		},
		// onEachFeature: function (feature, layer) {
		// 	layer.bindPopup(feature.properties.description);
		// }
	}).addTo(map);
} );

