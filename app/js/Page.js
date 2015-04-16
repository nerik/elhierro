var _ = require('underscore');
var L = require('leaflet/dist/leaflet-src');
var $ = require('jquery');
var Backbone = require('backbone');

import * as utils from './utils';

const DATA_ATTR_FLOATS = ['gpstracestart','gpstraceend'];

export default class Page  {
	constructor(index) {
		this.data = {};
		this.data.index = index;

		this.setupFromDom();
		this.loadData();
	}

	setupFromDom() {
		//get scroll points
		this.data.scrollBlocks = [];
		$('[data-trigger]').each( (i, el) => {
			el = $(el);
			var y = el.offset().top;

			var scrollBlock = {
				start: y,
				end: y+el.innerHeight(),
				data: utils.parseDataAttrFloats( el.data(), DATA_ATTR_FLOATS )
			};

			this.data.scrollBlocks.push(scrollBlock);
			// console.log(y)
		} );

		this.data.scrollBlocks = _.sortBy(this.data.scrollBlocks, s => s.start);
		// console.log(this.data.scrollBlocks);

		//get all gps traces for preloading
		this.data.gpstrace = [];
		$('[data-gpstrace]').each( (i, el) => { 
			this.data.gpstrace.push(  $(el).data('gpstrace')  ); 

		} );

		this.data.gpstrace = _.uniq(this.data.gpstrace);

		//preload timelapse spritesheets...


	}

	loadData() {
		console.log(this);
		var gpstracesPromises = this.data.gpstrace.map( gps => utils.load(`./data/${this.data.index}/${gps}.topojson` ) );

		Promise.all(gpstracesPromises).then( data => {
			console.log(data);

			this.trigger('load:gps', this.data.gpstrace, data.slice(0, gpstracesPromises.length) );


			this._start();
		});
	}

	_start() {
		document.addEventListener( 'scroll', e => this._onScroll() );
		this._prevY = 0;
		this._onScroll();
	}

	_onScroll() {
		// console.log(window.scrollY);

		var y = window.scrollY + window.innerHeight;
		var delta = y - this._prevY;
		var down = delta > 0;
		this._prevY = y;
		var isInBlock = false;

		for (var i = 0; i < this.data.scrollBlocks.length; i++) {
			var b = this.data.scrollBlocks[i];

			if (y >= b.start && y < b.end) {
				// console.log(s.data)
				var r = (y - b.start) / (b.end - b.start);

				b.r = r;

				this.trigger('scrollblock:scroll', b);

				if (i !== this._currentScrollBlockIndex) {
					console.log('enter:',b.data.gpstrace,down)
					this.trigger('scrollblock:enter', b, down);
				}

				isInBlock = true;
				this._currentScrollBlockIndex = i;

			} else {
				if (i === this._currentScrollBlockIndex) {
					console.log('leave:',b.data.gpstrace,down)
					this.trigger('scrollblock:leave', b, down);
				}
			}
		}
		if (!isInBlock) this._currentScrollBlockIndex = -1;
	}


	test(map) {
		this.map = map;
		return;



		// var testCoords, testPath, testPath2;


		// Promise.all([
		// 	utils.load('./data/6/0_car_topo.json'),
		// 	utils.load('./data/6/1_feet_test_topo.json'),
		// 	// utils.load('./data/6/2_car.json')
		// ]).then( data => {
		// 	//invert lat/lon manually :/

		// 	var car0topo = data[0];
		// 	var car0geo = topojson.feature(car0topo, car0topo.objects['0_car'] );

		// 	let car0 = car0geo.features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
		// 	L.polyline(car0, {color: 'red', dashArray: '10,10', lineCap: 'square', weight: 8, opacity: .3}).addTo(map);

		// 	var testTopo = data[1];
		// 	var testGeo = topojson.feature(testTopo, testTopo.objects['1_feet_test'] );

		// 	testCoords = testGeo.features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
		// 	testPath = L.polyline([], {color: 'red', weight: 8, opacity: .3}).addTo(map);
		// 	testPath2 = L.polyline([], {color: 'red', weight: 1, opacity: 1}).addTo(map);

		// 	// let car2 = data[2].features[0].geometry.coordinates.map( coords => [coords[1], coords[0]] );
		// 	// L.polyline([], {color: 'green'}).addTo(map);
		// });




		// // var videoTpl = _.template( document.querySelector('.tpl-video').firstChild.nodeValue );

		// // var videoContainer = new L.Popup({
		// // 							maxWidth: 400,
		// // 							maxHeight: 300,
		// // 							autoPan: false,
		// // 							offset: new L.Point(0,0)
		// // 						})
		// // 						.setLatLng([27.7, -17.9])
		// // 						.openOn(map);
		// // var video = document.querySelector('.video-player');

		// var numImages = 1026;
		// var targetWidth = 256;
		// var sheetWidth = 2048;

		// var targetHeight = targetWidth*.75;
		// var gridCols = sheetWidth/targetWidth;
		// var gridRows = Math.floor(gridCols/.75);
		// var spritesInSheet = gridCols * gridRows;
		// var numSS = Math.ceil(numImages/spritesInSheet);

		// var spritesheets = [];
		// var currentSpriteSheetIndex, currentSpriteSheetContainer, currentSpriteSheetCoords;
		// var img;

		// var timelapse = document.querySelector('.timelapse');
		// var timelapseLow = document.querySelector('.timelapse-low');
		// var timelapseMedium = document.querySelector('.timelapse-medium');

		// for (var i = 0; i < numSS; i++) {
		// 	img = document.createElement('div');
		// 	img.style.backgroundImage = 'url(data/6/timelapse/spritesheet_' + i + '.jpg)'; 
		// 	img.style.display = 'none'; 
		// 	spritesheets.push(img);
		// 	timelapseLow.appendChild(img);
		// }





		// var body = document.body,
		//     html = document.documentElement;

		// var totalScroll = Math.max( body.scrollHeight, body.offsetHeight, 
		//                        html.clientHeight, html.scrollHeight, html.offsetHeight );
		// totalScroll -= window.innerHeight;

		// var showMediumTimeout;
		// var mediumImage;

		// document.addEventListener('scroll', function (e) {
		// 	// console.log(window.scrollY);
				

		// 	if (!testCoords) return;

		// 	var scrollR = window.scrollY/totalScroll;
		// 	// console.log(scrollR)

		// 	testPath.setLatLngs( testCoords.slice(0, Math.floor( scrollR*testCoords.length ) ) );
		// 	testPath2.setLatLngs( testCoords.slice(0, Math.floor( scrollR*testCoords.length ) ) );

		// 	/*
		// 	var elem = document.querySelector('.test');
		// 	if (window.scrollY>1700 && elem.style.position !== 'fixed') {
		// 		elem.style.top = elem.getBoundingClientRect().top + 'px';
		// 		elem.style.position = "fixed";
		// 		elem.style.width = "200px";
		// 	} else if (window.scrollY<=1700 && elem.style.position === 'fixed') {
		// 		elem.style.top = 0;
		// 		elem.style.position = "relative";
		// 	}
		// 	*/

		// 	// console.log(video.seekable.start(), video.seekable.end() );
		// 	// video.currentTime = scrollR * video.duration;
		// 	// video.currentTime = scrollR * video.duration;

		// 	// var imgIndex = Math.floor(scrollR * images.length);
		// 	// console.log(imgIndex);
		// 	// videoContainer.setContent( images[ imgIndex ] );

		// 	var imgIndex = Math.floor(scrollR * numImages);
		// 	var spritesheetIndex = Math.floor( imgIndex / spritesInSheet );

		// 	//check against current ss index
		// 	if (spritesheetIndex !== currentSpriteSheetIndex) {
		// 		if (currentSpriteSheetContainer) currentSpriteSheetContainer.style.display = 'none';
		// 		currentSpriteSheetIndex = spritesheetIndex;
		// 		currentSpriteSheetContainer = spritesheets[spritesheetIndex];
		// 		currentSpriteSheetContainer.style.display = 'block';
		// 	}

		// 	//get position
		// 	var indexInSheet = imgIndex % spritesInSheet;
		// 	var col = indexInSheet % gridCols;
		// 	var row = Math.floor( indexInSheet / gridCols );

		// 	var spriteSheetCoords = [spritesheetIndex, indexInSheet];
		// 	// console.log(imgIndex, currentSpriteSheetIndex, indexInSheet, col, row)

			

		// 	if ( ! _.isEqual( currentSpriteSheetCoords, spriteSheetCoords ) ) {
		// 		var posX = col * targetWidth;
		// 		var posY = row * targetHeight;

		// 		currentSpriteSheetContainer.style.backgroundPosition = '-'+posX+'px -' + posY + 'px';
		// 		console.log('change');

		// 		clearTimeout (showMediumTimeout);

		// 		if (mediumImage) {
		// 			timelapseMedium.removeChild(mediumImage);
		// 			timelapseMedium.style.display = 'none';
		// 			timelapseLow.style.display = 'block';
		// 			mediumImage.removeEventListener('load', onMediumImageLoaded);
		// 			mediumImage = null;
		// 		}

		// 		showMediumTimeout = setTimeout( function () {
		// 			console.log(imgIndex)
		// 			mediumImage = document.createElement('img');
		// 			mediumImage.addEventListener('load', onMediumImageLoaded)
		// 			mediumImage.setAttribute('src', 'data/6/timelapse/medium/' + imgIndex + '.jpg');
		// 			mediumImage.setAttribute('class', 'medium');
		// 			timelapseMedium.appendChild(mediumImage);
					

		// 		}, 500)
		// 	}

		// 	currentSpriteSheetCoords = spriteSheetCoords;

			

		// });


		// var onMediumImageLoaded = function() {
		// 	timelapseMedium.style.display = 'block';
		// 	timelapseLow.style.display = 'none';
		// }

	}

}

//mixin BB.Events
_.extend(Page.prototype, Backbone.Events);