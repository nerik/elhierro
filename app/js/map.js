var L = require('leaflet/dist/leaflet-src');
var _ = require('underscore');
var $ = require('jquery');
var turf_polygon = require('turf-polygon');
var turf_point = require('turf-point');
var turf_centroid = require('turf-centroid');
var turf_bearing = require('turf-bearing');
var turf_destination = require('turf-destination');

import * as utils from './utils';

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


var gpsTpl = {
	feet: _.template( $('.js-tpl-gps-feet').html() ),
	car: _.template( $('.js-tpl-gps-car').html() ),
	para: _.template( $('.js-tpl-gps-feet').html() )
};


var gpsCollection = {};
var gpsArray = [];

var MapWrapper = {
	initGPS: function(names, topoJsonData) {

		for (var i = 0; i < topoJsonData.length; i++) {
			var topo = topoJsonData[i];
			var geo = topojson.feature(topo, topo.objects.stdin);
			var coords = geo.features[0].geometry.coordinates.map( coord => [coord[1], coord[0]] );
			var name = names[i];

			var polyline = L.polyline([]).addTo(map);

			//not so sure why className or $.className is not working here :/ 
			var transportMode = name.match(/\d_(.+)/)[1];
			var styleName = ( _.contains(['taxi', 'andrescar'], transportMode) ) ? 'car' : transportMode;
			$(polyline._container).attr('class','gps gps--'+styleName);


			var icon = L.divIcon({
				// html: '<div style="width: 10px; height: 10px; background-color: #ff00ff">x</div>'
				html: gpsTpl[styleName]()
			});
			var picto = L.marker([0,0], {icon:icon});
			picto.addTo(this.map);

			gpsCollection[name] = {
				name: name,
				index: i,
				polyline: polyline,
				coords: coords,
				picto: picto,
				pictoInner: $(picto._icon).find('.picto-inner')
			};

			gpsArray.push(gpsCollection[name]);




		}
	},

	updateGPS: function (name, r, follow) {
		var gps = gpsCollection[name];
		var lastCoordIndex = Math.min( Math.floor(r*gps.coords.length), gps.coords.length-1 ) ;
		gps.polyline.setLatLngs( gps.coords.slice(0, lastCoordIndex ) );

		//calculate loction of picto
		var bearingStartCoord = gps.coords[Math.max(0, lastCoordIndex-100)];
		var bearingEndCoord = gps.coords[lastCoordIndex];
		var bearingStart = turf_point( utils.swapLL(bearingStartCoord) );
		var bearingEnd = turf_point( utils.swapLL(bearingEndCoord) );
		var bearing = turf_bearing(bearingStart, bearingEnd);

		var dest = turf_destination(bearingEnd, .5, bearing, 'kilometers');

		console.log(dest.geometry.coordinates);


		// gps.picto.setLatLng( utils.swapLL(dest.geometry.coordinates) );
		gps.picto.setLatLng( bearingEndCoord );
		var pictoTransform = `rotate(${bearing}deg)`;

		$(gps.pictoInner).css('transform', pictoTransform);

		if (follow) {
			var meanCoords = gps.coords.slice( Math.max(0, lastCoordIndex-20), lastCoordIndex );
			meanCoords.push([ meanCoords[0][0], meanCoords[0][1] ] );
			var polygon = turf_polygon([
			  meanCoords
			]);
			var centroid = turf_centroid(polygon);
			map.panTo( centroid.geometry.coordinates, {animate: false});
		}
	},

	updateGPSStatuses: function(currentlyEntering) {
		console.log(currentlyEntering)

		for (var i = 0; i < gpsArray.length; i++) {
			var gps = gpsArray[i];
			var classes = $(gps.polyline._container).attr('class').split(' ');
			if (currentlyEntering === gps.name) {
				classes = _.without( classes, 'gps--old' );
			} else {
				classes.push('gps--old');
			}
			classes = _.uniq(classes);
			$(gps.polyline._container).attr('class', classes.join(' ') );
		}
	},

	setView(coords) {
		map.setView( [coords[1],coords[2]], coords[0]);
	},

	map: map
};


export default MapWrapper;