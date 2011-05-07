/**
 * Backflip is a slideshow that will flip the grid to view details about the item. 
 * It is built on top of CSS3 transform and transitions.
 * Backflip can build the slideshow markup dynamically (using JSON data) or use static data
 * @author Kris Hedstrom
 * @param targets {string}
 * @param options {object}
 */

var Backflip = function(target, options) {
	
	// if user accidentally omits the new keyword, this will 
	// silently correct the problem
	if (!(this instanceof Backflip)) {
		return new Backflip(target, options);
	}
      
	var self = this, // instance variable
		slideData = null;

	this.target = $(target);
	this.options = $.extend({
		animTimeFadeIn: 200, // animation duration for fade-in effect
		animTimeSlide: 200, // animation duration for slide
		content: 'static', // is the content static or dynamic?
		emptySlides: 4, // create empty slides to space out content @TODO: implement
		initialIndex: 0, // which section should be current (in focus) group
		minSwipe: 40, // minimum amount for a swipe to count (touches) 
		jsonPath: '_ui/json/backflip.json', // path to JSON data
		slidesPerSection: 24
	}, options || {});

	if(this.options.content === 'dynamic') {
		for(var i = 0, l = this.target.length; i < l; i++) {
			if(!slideData) {
				// get data from JSON
				$.getJSON(this.options.jsonPath, function(data) {
					// on success store the transport
					self.slideData = data;
					// build the markup
					self.build();
				});
			} else {
				// we already have the data, let's build this thingy
				this.build();
			}
		}
	} else {
		// we already have structure in place
		// @TODO: implement
	}

	this.setupEvents();
};

Backflip.prototype = {

	/**
	 * Create the markup needed
	 */
	build: function() {
		var size = this.slideData.slides.length, // number of items from the JSON data
			totalSections = Math.ceil(size / this.options.slidesPerSection) - 1, // total number of sections
			sectionCounter = 0,
			outer = $('<div class="outer-wrapper"/>'), // outer the wrapper centers the sections
			inner = $('<div class="inner-wrapper"/>'), // the inner wrapper has to be big enough to fit all sections
			nav = $('<nav/>'), // holds navigation
			prevBtn = $('<div class="previous"/>'),
			nextBtn = $('<div class="next"/>'),
			sectionItems = (totalSections + 1) * this.options.slidesPerSection;
		
		outer.append(inner).append(prevBtn).append(nextBtn);
		this.target.append(outer);
		this.wrapper = inner; // this is the layer that handles animation
		
		// make sure the currentIndex is within bounds
		this.currentIndex = (totalSections >= this.options.initialIndex) ? this.options.initialIndex : 0;

		for(var i = 0; i < sectionItems; i++) {
			if(i === 0 || i % this.options.slidesPerSection === 0) {
				var section = $('<section/>'),
					ul = $('<ul class="grid front"/>'),
					back = $('<div class="back"/>'),
					backContent = $('<div class="content"/>');
					closeBtn = $('<a href="#" class="close">Close</a>');
				if(sectionCounter === self.currentIndex) {
					// the current index should be active
					section.addClass('current');
				}
				
				sectionCounter++;
				back.append(closeBtn).append(backContent);
				section.append(ul).append(back);
				inner.append(section);
				
			}
			var li = $('<li/>'),
				span = $('<span />');
				
			if(this.slideData.slides[i]) {
				li.addClass(this.slideData.slides[i].type);
				var a = $('<a href="#' + i + '" class="thumb" />').css({
					'background-image': 'url(' + this.slideData.slides[i].thumbnail + ')', 
					'opacity': 0
					}).data('slideId', [i]);
				span.addClass('details').html(this.slideData.slides[i].title);
				a.append(span);
				li.append(a);
			} else {
				li.addClass('empty');
				li.append(span);
			}

			ul.append(li);
		}
 		
		// find the sections that we just added
		this.sections = this.target.find('section');

		// if we have enough sections to create a slideshow
		if(totalSections > 0) {
			// clone the last section
			var last = this.sections.last().clone().removeClass('current').addClass('clone last');
			// clone the first section
			var first = this.sections.first().clone().removeClass('current').addClass('clone first');
			// put the cloned "first" section in the last position and the "last" clone at the top
			this.wrapper.prepend(last).append(first);
			
		}
		// find the sections again, because they have changed
		this.sections = this.target.find('section');
		this.totalSections = this.sections.length - 1;
		this.slideTo(this.currentIndex+1, true);
		// animate in grid items
		this.animateThumbs(this.shuffle($('ul.grid li a')));
		
	},
	
	/**
	 * Fade in the thumbs, one by one
	 * @param els {collection}
	 */
	animateThumbs: function(els) {
		var self = this; // scope alias
		// Fade in the first element in the collection
		els.first().fadeTo(self.options.animTimeFadeIn, 1);
		setTimeout(function() {
			// Recurse, but without the first element
			self.animateThumbs(els.slice(1));
		}, 10);
	},
	
	/**
	 * Advance to the next slide / section
	 * @param index {number}
	 */
	next: function(index) {
		var next = this.currentIndex + 1;
		if(next <= this.totalSections) {
			this.slideTo(next);
		} 
	},
	
	/**
	 * Retreat to the previous slide / section
	 * @param index {number}
	 */
	previous: function(index) {
		var prev = this.currentIndex - 1;
		if(prev >= 0) {
			this.slideTo(prev);
		}
	},
	
	/**
	 * Setup events
	 */
	setupEvents: function() {
		var self = this;
		
		/**
		 * keyboard navigation
		 */
		$(document).keydown(function(e) {
			switch(e.keyCode) {
				case 27: // ESC key
					self.removeDetails();
					self.sections.removeClass('flipped'); // unflip
					break;
				case 37: // left arrow
					self.previous();
					break;
				case 39: // right arrow
				 	self.next();
					break;
				default: 
					break;
			}
		});
		
		/**
		 * Setup touch defaults... for now all we care about is X direction
		 */
		this.resetTouches();
		
		/**
		 * Touch events
		 * Note: jQuery's bind / live / delegate methods changes the event object. 
		 * To access the touch events use originalEvents (e.g. e.originalEvent.touches)
		 */
		this.target.bind('touchstart', function(e) {
			//e.preventDefault();
			if(e.originalEvent.touches.length === 1) { // only deal with one finger touches
				self.beginX = e.originalEvent.touches[0].pageX; // only concerned about horizontal swipes
			} else {
				self.resetTouches();
			}
		});
		
		this.target.bind('touchmove', function(e) {
			if (e.originalEvent.touches.length === 1 ) {
				self.currentX = e.originalEvent.touches[0].pageX;
			} else {
				self.resetTouches();
			}
		});
		
		this.target.bind('touchend', function(e) {
			if (self.currentX !== 0 ) {
				// check direction of swipe
				var swipeDirection = self.beginX - self.currentX;
				// make sure it's more than our minimum amount
				if(Math.abs(swipeDirection) >= self.options.minSwipe) {
					if(swipeDirection > 0) {
						self.next();
					} else {
						self.previous();
					}
				}
			} 
			self.resetTouches();
		});
		
		
		/**
		 * Mouse Events
		 */
		this.target.find('section:not(.current)').live('mouseenter', function(e) {
			self.target.addClass('hovered');
		});
		
		this.target.find('section.current').live('mouseenter', function(e) {
			self.target.removeClass('hovered');
		});
		
		this.target.find('section:not(.current)').live('click', function(e) {
			// get the index of the clicked section
			var sectionIndex = self.sections.index($(this));
			self.target.removeClass('hovered');
			if(sectionIndex < self.currentIndex) {
				self.previous();
			} else {
				self.next();
			}
		});
		
		this.target.find('.next').live('click', function(e) {
			self.next();
		});
		
		this.target.find('.previous').live('click', function(e) {
			self.previous();
		});
		
		this.target.find('a.thumb:not(.empty)').live('click', function(e) {
			e.preventDefault();
			// @TODO abstract out into its own method
			var section = $(this).parents('section'),
				sectionIndex = self.sections.index(section);
			if(section.hasClass('current')) {
				self.loadDetails($(this).data().slideId, sectionIndex);
				section.addClass('flipped');
			}

		});

		this.target.find('a.close').live('click', function(e) {
			e.preventDefault();
			// @TODO abstract out into its own method
			var section = $(this).parents('section');
			self.removeDetails();
			section.removeClass('flipped');
		});
	},
	
	/**
	 * Reset touch values
	 */
	resetTouches: function() {
		
		this.beginX = 0;
		this.currentX = 0;
		this.direction = null;
		this.deltaX = 0;
		
	},
	
	/**
	 * Empty all old content
	 */
	removeDetails: function() {
		this.sections.find('.content').empty();
	},
	
	/**
	 * Load the details (back)
	 * @param index {number}
	 * @param sectionIndex {number}
	 */
	loadDetails: function(index, sectionIndex) {
		
		
		var data = this.slideData.slides[index],
			i,
			l,
			content = this.sections.eq(sectionIndex).find('.content');
		// empty out old details
		content.empty();
		
		if(data.type === 'image') {
			// create new image(s)
			for(i = 0, l = data.source.length; i < l; i++) {
				var img = $('<img/>').attr('src', data.source[i]);
				content.append(img);
			}
		} else if(data.type === 'video') {
			var video = $('<video width="945" height="532" controls autoplay/>');
			
			for(i = 0, l = data.source.length; i < l; i++) {
				var source = $('<source src="' + data.source[i].src + '" type="' + data.source[i].type + '"/>');
				video.append(source);
			}
			content.append(video);
		} else {
			// do something else
		}
		
		// details / captions, etc
		var details = $('<ul class="details"/>');
		var title = $('<li class="title"/>').html(data.title);
		var credits = $('<li class="credits"/>').html(data.credits);
		details.append(title).append(credits);
		if(data.url) {
			var url = $('<li class="url"><a href="' + data.url + '">Link</a></li>');
			details.append(url);
		}
		
		content.append(details);
		
	},
	
	
	/**
	 * Shuffle an array
	 * based on Fisher-Yates algorithm:
	 * http://en.wikipedia.org/wiki/Fisher-Yates_shuffle
	 * @param els {array}
	 */
	shuffle: function(els) {
		var i = els.length;
		if (i > 0) {
			while (--i) {
				var j = Math.floor(Math.random() * (i + 1));
				var tempi = els[i];
				var tempj = els[j];
				els[i] = tempj;
				els[j] = tempi;
			}
			return els;
		} else {
			return false;
		}
	},

	/**
	 * Slide the inner wrapper
	 * @param index {number}
	 * @param jump {boolean}
	 */
	slideTo: function(index, jump) {
		
		var self = this;
		// close any open back windows + current class
		this.sections.removeClass('flipped').removeClass('current');
		
		// update index
		this.currentIndex = index;
		

		// find element
		var el = this.sections.eq(index);
		if(el.length === 0) {
			el = this.sections.eq(0);
		}
		// find offset
		var left = '-' + el[0].offsetLeft + 'px';
		
		if(!jump) {
			// animate
			this.wrapper.stop().animate({left: left}, this.options.animTimeSlide, function(e) {
				// update current class
				el.addClass('current'); 
				if(el.hasClass('first')) {
					// jump to first slide so we don't have to keep cloning stuff 
					// (only really looks okay if the animation is quick)
					self.slideTo(1, true); 
				} else if(el.hasClass('last')) {
					self.slideTo(self.totalSections - 1, true);
				}
			});
		} else {
			// jump
			self.wrapper.stop().css({left: left});
			el.addClass('current');
		}
	}
	
};

jQuery(document).ready(function() {
	$('html').removeClass('no-js');
	var backflip = new Backflip('#backflip', {content: 'dynamic'});
});