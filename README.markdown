# Backflip

Demo: [http://backflip.k-create.com](http://backflip.k-create.com)

Backflip is slideshow module built on jQuery that uses a whole bunch of CSS3 transitions, and 3D transforms, in browsers that support them, to display a grid of thumbnails and a "back" view. Once the user selects a thumbnail the section will flip the card over and display a larger, more detailed, view of the item. Get it? Backflip. So lame... I'm sorry.

Backflip takes JSON data as its input and either constructs the entire DOM structure or uses the existing markup (if the JSON is parsed and turned into HTML by a server-side technology).

## Browser support (as of May 5, 2011)

I built this in only a few hours so it's not production ready by any means. Having said that, Backflip should work in most browsers, although features may or may not be available, at the most basic level it should degrade peacefully. CSS transitions and 2D transforms are generally supported in most modern browsers (Firefox 4, Safari 5, Chrome, IE 9). CSS3 3D transformations (in the z-axis) is only supported by WebKit, so only Webkit browsers will get the 'flipcard' effect. Google Chrome does not support -webkit-backface-visibility or -webkit-perspective so while it gets a flip effect, because it lacks depth of view, it won't appear three dimensional. Safari 5 and MobileSafari are, currently, the only browsers that render the 3D effects.

* Safari 5+
* Google Chrome (flip effect, but not 3d)
* Firefox4 (no flip effect)
* Firefox3.6 (no flip effect or transitions)
* IE9 (no flip effect, buggy. Weird in general.)
* IE8 (no flip effect, no transitions, doesn't understand nth-child so needs extra attention)
* IE7 (janky, don't really care about you)
* IE6 (not even attempted to view, seriously don't care)

## To-dos

This an experimental prototype and there are lots of things that I'd like to fix or add:

1. Implement an existing structure solution
2. UI improvements, previous / next buttons
3. Re-write it in native JS for library independence
4. Feature detection for nicer transitions if browser doesn't support 3D transforms
5. Skin video player
6. Add loaders to images and videos
7. <del>Add touch events</del>
8. Add resize events
9. Add History API / #! deep linking. Possibly.

## Change log

**0.2.0 - May 8, 2011**

Added CSS3 translate3D (in browsers that understand it) for horizontal section animations. Plugifying - the script can be called as a plugin or using the <code>new</code> keyword.

**0.1.1 - May 6, 2011**

Added touch events

**0.1.0 - May 5, 2011**

Initial Commit