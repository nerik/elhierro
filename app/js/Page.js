var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');

import * as utils from './utils';
import Timelapse from './Timelapse';

export default class Page  {
	constructor(index) {
		this.data = {};
		this.data.index = index;

		this._currentScrollBlockIndexes = [];

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
				data: utils.parseDataAttrFloats( el.data() ),
				el: el
			};

			//format/parse properties on the data object
			_.each(scrollBlock.data, (v,k) => {
				if (v === '') scrollBlock.data[k] = true;
		        if ( _.contains(['gpstracestart','gpstraceend'], k) ) scrollBlock.data[k] = parseFloat(v);
		        if (k === 'mapview') scrollBlock.data[k] = scrollBlock.data[k].split('/').map( parseFloat );
		    });

			this.data.scrollBlocks.push(scrollBlock);		

		} );

		this.data.scrollBlocks = _.sortBy(this.data.scrollBlocks, s => s.start);



		//get all gps traces for preloading
		this.data.gpstrace = [];
		$('[data-gpstrace]').each( (i, el) => { 
			this.data.gpstrace.push(  $(el).data('gpstrace')  ); 

		} );

		this.data.gpstrace = _.uniq(this.data.gpstrace);

		
		this.data.timelapse = $('[data-timelapse]').length;
		if (this.data.timelapse) {
			$('.js-imgprv').hide();
		}

	}

	loadData() {
		var gpstracesPromises = this.data.gpstrace.map( gps => utils.load(`./data/${this.data.index}/${gps}.topojson` ) );

		Promise.all(gpstracesPromises).then( data => {

			this.trigger('load:gps', this.data.gpstrace, data.slice(0, gpstracesPromises.length) );

			this._start();
		});


		//preload timelapse spritesheets...
	}

	_start() {
		this._prevY = 0;
		this._title = $('h1');
		
		$('.title-overlay').addClass('title-overlay--ready');

		if (this.data.timelapse) this._timelapse = new Timelapse();
		document.addEventListener( 'scroll', e => this._onScroll() );
		this._onScroll();
	}

	_onScroll() {
		// console.log(window.scrollY);

		var y = window.scrollY + window.innerHeight;
		var delta = y - this._prevY;
		var down = delta > 0;
		this._prevY = y;
		var isInBlock = false;
		var titleY = -50 - (window.scrollY*0.02);
		this._title.css('margin-top', titleY + '%' );

		for (var i = 0; i < this.data.scrollBlocks.length; i++) {
			var b = this.data.scrollBlocks[i];

			if (y >= b.start && y < b.end) {
				var r = (y - b.start) / (b.end - b.start);

				b.r = r;

				if ( !_.contains(this._currentScrollBlockIndexes, i) ) {
					// console.log('enter:',b.data.gpstrace,down)
					this._currentScrollBlockIndexes.push(i);

					this.trigger('scrollblock:enter', b, down);

					//show next element, a fixed element corresponding to this placeholder
					if (b.data.fixed) b.el.next('.fixed').addClass('show');

					if (b.data.revealparent) {
						b.el.parents('.concealed').addClass('concealed--revealed');
					}

				}
				this.trigger('scrollblock:scroll', b);


				isInBlock = true;				

			} else {
				if ( _.contains(this._currentScrollBlockIndexes, i) ) {
					// console.log('leave:',b.data.gpstrace,down)
					this._currentScrollBlockIndexes = _.without(this._currentScrollBlockIndexes, i);

					this.trigger('scrollblock:leave', b, down);

					b.el.next('.fixed').removeClass('show');

					if (b.data.concealparent) {
						b.el.parents('.concealed').removeClass('concealed--revealed');
					}
				}
			}


		}
		// if (!isInBlock) this._currentScrollBlockIndex = -1;
	}


	startTimelapse() {
		$('.js-imgprv').show();
	}	

	updateTimelapse(block, r) {
		this._timelapse.update(r);
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