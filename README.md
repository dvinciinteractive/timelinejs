timelinejs
=========

timelinejs is a simple library for creating a series of events which can be played, paused, and resumed. 

The type of events:
* playing audio
* animate element
* pausing
* adding markers for searching, forwarding, & rewinding
* setting inner html
* execute function
* add your own!
 
### Adding your own

You can add your own event by registering it with the Timeline class:

```js
Timeline.register('addCustom', {
  create: function( arguments... ) {},
  start: function( oncomplete ) {},
  pause: function() {},
  resume: function( oncomplete ) {}
});
```
And you can queue up that event later.

```js
mytimeline.addCustom( 'Hello World!', 10 );
```

Checkout the example!
