window.$ = require('jquery');

var _ = require('underscore');
var L = require('leaflet/dist/leaflet-src');

import Page from './Page';
import map from './map';


var page = new Page(3);
page.test(map.map);

//when at the end of the page : load next page + dependencies + n+2 page intro


page.on('load:gps', (names, topoJsonData) => map.initGPS(names, topoJsonData) );

page.on('scrollblock:scroll', block => {
	if (block.data.gpstrace) updateGPS(block);	
});

page.on('scrollblock:enter', (block, down) => {
	if (block.data.gpstrace) {
		updateGPS( block, (down) ? -1 : 1 );
		map.updateGPSStatuses( block.data.gpstrace );
	}
	if (block.data.mapview) map.setView(block.data.mapview);
});
page.on('scrollblock:leave', (block, down) => {
	if (block.data.gpstrace) updateGPS(block, (down) ? 1 : -1 );
});

function updateGPS(block, startOrEnd) {
	var start = (block.data.gpstracestart) ? block.data.gpstracestart : 0;
	var end = 	(block.data.gpstraceend) ? 	 block.data.gpstraceend : 1;

	var r;
	if (_.isUndefined(startOrEnd)) {
		var delta = end - start;
		r = (block.r * delta) + start;
	} else {
		r = (startOrEnd===-1) ? start : end;
	}  

	map.updateGPS(block.data.gpstrace, r, !_.isUndefined(block.data.gpstracefollow) );
}

$('.geocodedImages img').each(function(index, el) {
	console.log(el);

	var coords = $(el).data('coords');
	$(el).addClass('geocoded');

	var m = new L.Marker(coords.split(',') ).
		bindPopup(el).
		addTo(map.map);

});