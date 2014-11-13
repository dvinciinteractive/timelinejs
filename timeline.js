
/**
 * A timeline contains a queue of events it executes in order. It has typical player methods
 * like play, reset, pause, and stop. The timeline is also searchable and can forward or rewind
 * to any event given a property name and expected value.
 *
 * New event types can be added with the register method:
 *
 *		Timeline.register('addCustom', {
 * 			create: function( arguments... ) {},
 * 			start: function( oncomplete ) {},
 *      pause: function() {},
 *			resume: function( oncomplete ) {}
 * 		});
 *
 * And can be called like so:
 * 
 * 		timeline.addCustom('Hello World!', 10);
 *
 * Which invokes the create method where this is the instance of that event.
 */
function Timeline()
{
	var timeline = this;
	
	this.clear();
	this.oncomplete = [function() {
		if (timeline.current) {
			timeline.current = timeline.current.next;
			timeline.invoke( 'start', timeline.oncomplete );
		}
	}];
}

/**
 * Plays the timeline if it's paused or at the beginning.
 */
Timeline.prototype.play = function()
{
	if (!this.current) {
		this.current = this.head;
	}
	if (this.paused) {
		this.invoke( 'resume', this.oncomplete );
	} else if (!this.playing) {
		this.invoke( 'start', this.oncomplete );
	}
	this.playing = true;
	this.paused = false;
};

/** 
 * Pauses the timeline if it's currently playing.
 */
Timeline.prototype.pause = function()
{
	if (this.current && !this.paused && this.playing) {
		this.invoke( 'pause', [] );
		this.paused = true;
		this.playing = false;
	}
};

/**
 * Stops the timeline if it's currently playing and resets it to the beginning.
 */
Timeline.prototype.stop = function()
{
	this.pause();
	this.current = null;
	this.paused = false;
	this.playing = false;
}

/** 
 * Adds the given event to the end of the queue.
 */
Timeline.prototype.add = function(event)
{
	if (this.size == 0) {
		this.head = event;
	} else {
		this.tail.next = event;
	}
	event.prev = this.tail;
	this.tail = event;
	this.size++;
};

/**
 * Stops the timeline if it's playing and clears all events from the queue.
 */
Timeline.prototype.clear = function()
{
	this.stop();
	this.size = 0;
	this.head = null;
	this.tail = null;
	this.size = 0;
};

/**
 * Sets the currently playing event to the next event which has a field with the given value. 
 * It can skip N numbers of matches, the default is 1.
 */
Timeline.prototype.next = function(field, value, skip)
{	
	var next = this.findNext(field, value, skip);
	
	if (next) {
		this.current = next;
		this.invoke( 'start', this.oncomplete );
		this.playing = true;
	} else {
		this.current = null;
	}
	
	return !!next;
};

/**
 * Returns whether the timeline has an event which has a field with the given value after the currently playing event.
 */
Timeline.prototype.hasNext = function(field, value, skip)
{
	return this.findNext(field, value, skip) !== null;
};

/**
 * Finds the next event in the timeline which has a field with the given value, optionally skipping N matches.
 */
Timeline.prototype.findNext = function(field, value, skip)
{
	return this.findGeneric('next', field, value, skip);
};

/**
 * Sets the currently playing event to the previous event which has a field with the given value. 
 * It can skip N numbers of matches, the default is 1.
 */
Timeline.prototype.prev = function(field, value, skip, restart)
{
	var restartsies = !!restart;
	var prev = this.findPrev(field, value, skip);
	
	if (prev) {
		this.current = prev;
		this.invoke( 'start', this.oncomplete );
		this.playing = true;
	} else if (restartsies) {
		this.current = this.head;
		this.invoke( 'start', this.oncomplete );
		this.playing = true;
	} else {
		this.current = null;
	}
	
	return !!prev;
};

/**
 * Returns whether the timeline has an event which has a field with the given value before the currently playing event.
 * If the timeline is not playing or paused this method will have no effect.
 */
Timeline.prototype.hasPrev = function(field, value, skip)
{
	return this.findPrev(field, value, skip) !== null;
};

/**
 * Finds the previous event in the timeline which has a field with the given value, optionally skipping N matches.
 */
Timeline.prototype.findPrev = function(field, value, skip)
{
	return this.findGeneric('prev', field, value, skip);
};

/**
 * Finds an event from the current event going in the "link" direction which has a field with the given value,
 * optionally skipping N matches. If the timeline is not playing or paused this method will return null.
 */
Timeline.prototype.findGeneric = function(link, field, value, skip)
{
	if (!this.paused) {
		this.invoke( 'pause', [] );	
	} else {
		this.paused = false;
	}
	if (!this.current) {
		this.current = this.head;
	}
	
	var skipsies = skip || 1;
	var node = this.current;
	if (node) {
		node = node[link];
		while (node) {
			if (field in node && node[field] == value) {
				if (--skipsies === 0) {
					return node;			
				}
			}
			node = node[link];
		}
	}
	return null;
};

/** 
 * Sets the currently playing event to an event which has a field with the given value. Events
 * will first be searched through next events, and if none is found, through previous events.
 * It can skip N numbers of matches, the default is 1.
 */
Timeline.prototype.search = function(field, value, skip)
{
	var node = this.findNext(field, value, skip);
	if (!node) {
		node = this.findPrev(field, value, skip);
	}
	this.current = node;
	this.invoke( 'start', this.oncomplete );
};

/** 
 * Invokes an event method on the current event with the given arguments.
 */
Timeline.prototype.invoke = function(method, arguments)
{
	// The current event has to have a name, it must exist in Timeline.events, and it must have the given method.
	if (this.current && this.current._name && 
		this.current._name in Timeline.events && 
		method in Timeline.events[this.current._name]) 
	{	
		// Only then can you call the method.
		Timeline.events[this.current._name][method].apply(this.current, arguments);		
	}
};

/**
 * The map of event methods by event name.
 */
Timeline.events = {};

/**
 * Registers a new event given a name. The name is used as a method name to add to the Timeline prototype.
 * The event methods should be create, start, pause, and resume.
 */
Timeline.register = function(eventName, eventMethods)
{
	// check that the method or event does not exist in Timeline yet.
	if (eventName in Timeline.events || eventName in Timeline.prototype) {
		return;
	}
	
	// Save the event methods by their name.
	Timeline.events[eventName] = eventMethods;

	// Add the method to the prototype to make it available to all timelines.
	Timeline.prototype[eventName] = function()
	{
		var event = { _name:eventName };
		eventMethods.create.apply( event, arguments );
		this.add(event);
		return event;
	};
};

