window.$ = require('jquery');


import Page from './Page';
import map from './map';


var page = new Page(3);
page.test(map.map);

//when at the end of the page : load next page + dependencies + n+2 page intro


page.on('load:gps', (names, topoJsonData) => map.initGPS(names, topoJsonData) );

page.on('scrollblock:scroll', block => {
	// console.log(block);
	if (block.data.gpstrace) {
		var start = (block.data.gpstracestart) ? block.data.gpstracestart : 0;
		var end = 	(block.data.gpstraceend) ? 	 block.data.gpstraceend : 1;

		var delta = end - start;
		var r = (block.r * delta) + start;
		console.log(r);
		map.updateGPS(block.data.gpstrace, r);
	}
});

