# jQuery UI Croppable - A plugin for web-based image cropping

## WARNING: alpha version
This version is not intended for production use.
If you want to use it anyway, make sure you understand the source code completely.

## What exactly does it do?
When called on an jQuery object of an image, Croppable creates the necessary elements and JavaScript to make a nice interface for determining the dimensions of a cropped image. I needed support for multiple crop handles within a single image and neither jCrop nor the original Croppable seemed to support this, so I wrote it myself.

## What do I need to use it?
You'll need jQuery, jQuery UI and some backend that supports cropping. Croppable returns an coordinate object with left/top/width/height values of the crop box. I developed this with jQuery 1.7.1 and jQuery UI 1.8.22.

## How do I use it?
Call the plugin on an image and pass it some configuration options.

### Example:
```javascript
$('#some-image').croppable(
{
  handles: {
    handle1: {
      // background color of the selection
      bgColor: 'red',
      
       // used for Resizable minWidth and minHeight. Currently required.
      minSize : {width:200,height:50},
      
      // used for Resizable aspectRatio
      aspectRatio: true,
      
       // when given, displays a little preview box in the given element
       // the bgColor is used as the border color for the preview
      $preview: $( '#handle1-preview' ), 
      
      // set the initial position, width and height of the frame
      initialSelection: {
        left: 0,
        top: 0,
        width: frames.handset.width,
        height: frames.handset.height
      }
    },
    handle2: {
      ...
    }
  }
});
```

You can listen for coordinates using standard jQuery events.

## Events to bind on
The parameters are the same on both events:

* evt is the original event
* box is an object representing the box
* coords is an representing the box coordinates at the time the event fired

The events derive from jQuery UI resizeable (start, resize, stop) and draggable (start, drag, stop).

### croppable.change
This event fires everytime the crop box size is changed.

When preview is activated for the crop box, this event is used internally for updating the preview.

_Example_
```javascript
$('#some-image').on(
  'croppable.change,
  function( evt, box, coords )
  {
    console.log( box.name, 'changed its coordinates: ', coords.left, coords.top, coords.width, coords.height );
  }
);
```

### croppable.select
This event fires when the user has finished a crop box resize.

_Example_
In this example, the event is used to populate the crop values to hidden input fields like in jcrop.

```javascript
$('#some-image').on(
  'croppable.select',
  function( evt, box, coords )
  {
    $( '#' + box.name + '-crop-left' ).val( coords.left );
    $( '#' + box.name + '-crop-top' ).val( coords.top );
    $( '#' + box.name + '-crop-width' ).val( coords.width );
    $( '#' + box.name + '-crop-height' ).val( coords.height );
  }
);
```

## What kind of backend can I use to crop the image?
See [original repository](https://github.com/EvilScott/jquery-ui-croppable).

## Known issues
### Resize to top/left
The jQuery UI resizeable plugin seems to be buggy when resizing is used with an combination of containment and minWidth/minHeight.
When a crop box is at the top/left corner and the users pulls the resize handle to top/left, the calculation messes up and the box gets smaller than minWidth/minHeight. When changing the size again, the box jumps back to minWidth/minHeight.

### Minified version missing
I was to lazy to include one. Also, minified versions can be generated easily, and I think resources that can be generated should not be put under version control.

Currently only tested in Chrome 21.0.x.
