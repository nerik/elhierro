window.$ = require('jquery');

var _ = require('underscore');
var L = require('leaflet/dist/leaflet-src');

import CustomPage5 from './pages/5';
import Page from './Page';
import map from './map';

var pageIndex = parseInt(document.body.id);
var page = new Page(pageIndex);
page.test(map.map);

//when at the end of the page : load next page + dependencies (js, spritesheets, images, topjpson) + n+2 page intro



page.on('load:gps', (names, topoJsonData) => {
	map.initGPS(names, topoJsonData);
	if (pageIndex === 5) {
		CustomPage5(map, page);
	}

});

page.on('scrollblock:scroll', block => {
	if (block.data.gpstrace) {
		var progress = updateGPS(block);
		if (block.data.timelapse) {
			page.updateTimelapse(block, block.r);
		}
	}	
	
});

page.on('scrollblock:enter', (block, down) => {
	if (block.data.gpstrace) {
		var progress = updateGPS( block, (down) ? -1 : 1 );
		map.updateGPSStatuses( block.data.gpstrace );

		if (block.data.timelapse) {
			page.startTimelapse();
		}
	}
	if (block.data.mapview) map.setView(block.data.mapview);

	if (block.data.geocodedimages) map.showGeocodedImages( block.el );
});

page.on('scrollblock:leave', (block, down) => {
	if (block.data.gpstrace) updateGPS(block, (down) ? 1 : -1 );
});

function getProgressOnGPSTrack(block, startOrEnd) {
	var start = (block.data.gpstracestart) ? block.data.gpstracestart : 0;
	var end = 	(block.data.gpstraceend) ? 	 block.data.gpstraceend : 1;

	var r;
	if (_.isUndefined(startOrEnd)) {
		var delta = end - start;
		r = (block.r * delta) + start;
	} else {
		r = (startOrEnd===-1) ? start : end;
	}  
	return r;
}

function updateGPS(block, startOrEnd) {
	var r = getProgressOnGPSTrack(block, startOrEnd);
	map.updateGPS(block.data.gpstrace, r, !_.isUndefined(block.data.gpstracefollow) );
	return r;
}

$('.modal').on('click', e => {
	$('body').removeClass('isModalOpen');
});

export default page;
