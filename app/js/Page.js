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

			var scrollBlockData = utils.parseDataAttrFloats( el.data() );
			//format/parse properties on the data object
			_.each(scrollBlockData, (v,k) => {
				if (v === '') scrollBlockData[k] = true;
		        if ( _.contains(['gpstracestart','gpstraceend'], k) ) scrollBlockData[k] = parseFloat(v);
		        if (k === 'mapview') scrollBlockData[k] = scrollBlockData[k].split('/').map( parseFloat );
		    });

			var y = el.offset().top;

			var scrollBlock = {
				start: y,
				end: y+el.innerHeight(),
				data: scrollBlockData,
				el: el
			};


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

		//FIXME : do that constantly??
		var titleY = -50 - (window.scrollY*0.02);
		this._title.css('margin-top', titleY + '%' );

		for (var i = 0; i < this.data.scrollBlocks.length; i++) {
			var b = this.data.scrollBlocks[i];

			var triggerY = y;

			if (b.data.scrolltriggeroffset) {
				triggerY -= window.innerHeight * b.data.scrolltriggeroffset;
			}

			if (triggerY >= b.start && triggerY < b.end) {
				var r = (triggerY - b.start) / (b.end - b.start);

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

}

//mixin BB.Events
_.extend(Page.prototype, Backbone.Events);