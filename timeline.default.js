
/**
 * ================ PLAYING AUDIO =================
 * 
 * timeline.addAudio( 'music.mp3' );
 */

Timeline.register('addAudio', {
	create: function(url, volume) {
		this.url = url;
		this.volume = typeof(volume) !== 'undefined' ? volume : 1.0;
		this.audio = null;
	},
	start: function(oncomplete) {
		var event = this;
		this.audio = new Audio(this.url);
		this.audio.addEventListener('ended', function() {
			oncomplete();
			event.audio = null;
		});
		this.audio.addEventListener('error', function() {
			oncomplete();
			event.audio = null;
		});
		this.audio.volume = Math.min(this.volume, Timeline.audio.maxVolume);
		this.audio.play();
	},
	pause: function() {
		this.audio.pause();
	},
	resume: function(oncomplete) {
		this.audio.volume = Math.min(this.volume, Timeline.audio.maxVolume);
		this.audio.play();
	}
});

/**
 * Whether addAudio is supported for timelines.
 */
Timeline.isAudioSupported = function()
{
	return !!window.Audio;
};

/**
 * Audio settings.
 *
 * TODO keep track of playing audios so their volumes can be changed immediately.
 */
Timeline.audio = 
{
	maxVolume: 1.0
};

/**
 * ================ PAUSING =================
 * 
 * timeline.addPause( 500 ); // millis
 */

Timeline.register('addPause', {
	create: function(millis) {
		this.millis = millis;
		this.timeout = null;
		this.start = 0;
		this.elapsed = 0;
	},
	start: function(oncomplete) {
		this.timeout = setTimeout(oncomplete, this.millis);
		this.start = new Date().getTime();
	},
	pause: function() {
		this.elapsed = new Date().getTime() - this.start;
		clearTimeout(this.timeout);
		this.timeout = null;
	},
	resume: function(oncomplete) {
		if (this.elapsed < this.millis) {
			this.timeout = setTimeout(oncomplete, this.millis - this.elapsed);
			this.time = new Date().getTime() - this.elasped;
			this.elapsed = 0;
		} else {
			oncomplete();
		}
	}
});

/**
 * ================ CALLBACK EXECUTION =================
 * 
 * timeline.addExecute( function() {
 * 		console.log("I've been played!");
 * } );
 */

Timeline.register('addExecute', {
	create: function(callback) {
		this.callback = callback;
	},
	start: function(oncomplete) {
		this.callback();
		oncomplete();
	}
});

/**
 * ================ ANIMATING ELEMENTS =================
 * 
 * timeline.addAnimation( $('#elements'), {left:'200px'}, 500, 'linear' ); // jquery, properties[, duration[, easing]]
 */

Timeline.register('addAnimation', {
	create: function(jquery, properties, duration, easing) {
		this.jquery = jquery;
		this.properties = properties;
		this.duration = duration || duration === 0 ? duration : 400;
		this.easing = easing || 'swing';
		this.time = 0;
		this.elapsed = 0;
	},
	start: function(oncomplete) {
		this.jquery.animate(this.properties, this.duration, this.easing, oncomplete);
		this.time = new Date().getTime();
	},
	pause: function() {
		this.jquery.stop(true, false);
		this.elapsed = new Date().getTime() - this.time;
	},
	resume: function(oncomplete) {
		if (this.elapsed < this.duration) {
			this.jquery.animate(this.properties, this.duration - this.elapsed, this.easing, oncomplete);			
			this.time = new Date().getTime() - this.elasped;
			this.elapsed = 0;
		} else {
			this.jquery.css(this.properties);
			oncomplete();
		}
	}
});

/**
 * ================ SETTING INNER HTML =================
 * 
 * timeline.addHtml( $('#elements'), '<b>HTML</b>' );
 */

Timeline.register('addHtml', {
	create: function(jquery, html) {
		this.jquery = jquery;
		this.html = html;
	},
	start: function(oncomplete) {
		this.jquery.html( this.html );
		oncomplete();
	}
});

/**
 * ================ ADDING MARKERS FOR SEARCHING =================
 * 
 * timeline.addMarker( 'marker', 'title-screen' );
 * timeline.search( 'marker', 'title-screen' );
 * timeline.addMarker( 'marker', 'new-chapter' );
 * timeline.next( 'marker', 'new-chapter' );
 * timeline.prev( 'marker', 'new-chapter' );
 */

Timeline.register('addMarker', {
	create: function(marker, value) {
		this[marker] = value;
	},
	start: function(oncomplete) {
		oncomplete();
	}
});

/**
 * ================ WAITING FOR DOM EVENTS =================
 * 
 * timeline.addWaitUntil( $('#elements'), 'click' );
 */

Timeline.register('addWaitUtil', {
	create: function(jquery, event) {
		this.jquery = jquery;
		this.event = event;
		this.oncomplete = null;
		
		var my = this;
		this.handler = function() {
			my.jquery.off( my.event, my.handler );
			my.oncomplete();
		};
	},
	start: function(oncomplete) {
		this.oncomplete = oncomplete;
		this.jquery.on( this.event, this.handler );
	},
	pause: function() {
		this.jquery.off( this.event, this.handler );
	},
	resume: function(oncomplete) {
		this.oncomplete = oncomplete;
		this.jquery.on( this.event, this.handler );
	}
});

/**
 * ================ APPENDING HTML OR ELEMENTS =================
 * 
 * timeline.addAppend( $('#elements'), 'text to append or elements' );
 */

Timeline.register('addAppend', {
	create: function(jquery, append) {
		this.jquery = jquery;
		this.append = append;
	},
	start: function(oncomplete) {
		this.jquery.append( this.append );
		oncomplete();
	}
});

/**
 * ================ PREPENDING HTML OR ELEMENTS =================
 * 
 * timeline.addPrepend( $('#elements'), 'text to prepend or elements' );
 */

Timeline.register('addPrepend', {
	create: function(jquery, append) {
		this.jquery = jquery;
		this.append = append;
	},
	start: function(oncomplete) {
		this.jquery.prepend( this.append );
		oncomplete();
	}
});

/**
 * ================ SET CSS OF ELEMENTS =================
 * 
 * timeline.addCss( $('#elements'), {color:'red'} );
 */

Timeline.register('addCss', {
	create: function(jquery, css) {
		this.jquery = jquery;
		this.css = css;
	},
	start: function(oncomplete) {
		this.jquery.css( this.css );
		oncomplete();
	}
});