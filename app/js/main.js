var L = require('leaflet/dist/leaflet-src');
var _ = require('underscore');

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


var testCoords, testPath;

Promise.all([
	getXHRPromise('./data/6/0_car.json'),
	getXHRPromise('./data/6/1_feet.json'),
	getXHRPromise('./data/6/2_car.json')
]).then( data => {
	//use Leaflet Omnivore w/Topojson instead??
	//invert lat/lon
	testCoords = data[0].features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
	testPath = L.polyline([], {color: 'red'}).addTo(map);

	let feet1 = data[1].features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
	L.polyline(feet1, {color: 'blue', dashArray: '10,10'}).addTo(map);

	let car2 = data[2].features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
	L.polyline([], {color: 'green'}).addTo(map);
});


var totalScroll = 2200;
document.addEventListener('scroll', function (e) {
	// console.log(window.scrollY);
		

	if (!testCoords) return;

	var scrollR = window.scrollY/totalScroll;


	testPath.setLatLngs( testCoords.slice(0, Math.floor( scrollR*testCoords.length ) ) );

	console.log(window.scrollY);

var elem = document.querySelector('.test');
	if (window.scrollY>1700 && elem.style.position !== 'fixed') {
		elem.style.top = elem.getBoundingClientRect().top + 'px';
		elem.style.position = "fixed";
		elem.style.width = "200px";
	} else if (window.scrollY<=1700 && elem.style.position === 'fixed') {
		elem.style.top = 0;
		elem.style.position = "relative";
	}
});



