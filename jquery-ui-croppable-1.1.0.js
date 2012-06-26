// create jQuery function using Croppable
(function ( $ ) {

    var Croppable = {

        // size holding div, line up resizer div, and enable button
        init: function(image, options) {

            // save image for crop to use
            self.image = image;

            // create cropping box and resize handle
            self.image.parent().append('<div id="crop-box">' +
                '<div class="ui-resizable-handle ui-resizable-se" id="resize-handle-se"></div>' +
                '<div class="ui-resizable-handle ui-resizable-sw" id="resize-handle-sw"></div>' +
                '<div class="ui-resizable-handle ui-resizable-nw" id="resize-handle-nw"></div>' +
                '<div class="ui-resizable-handle ui-resizable-ne" id="resize-handle-ne"></div>' +
            '</div>');

            // style crop box, resize handle, and image
            $('#crop-box').css({
                'z-index':    '1000',
                'position':   'absolute',
                'cursor':     'move',
                'background-image': 'url("' + self.image.attr('src') + '")',
                'background-repeat': 'no-repeat',
                'background-attachment': 'fixed'
            });
            $('#crop-box #resize-handle-se').css({
                'z-index':    '1001',
                'position':   'absolute',
                'bottom':     '0',
                'right':      '0',
                'cursor':     'se-resize',
                'height':     '25px',
                'width':      '25px',
                'background': '#B94A48'
            });
            $('#crop-box #resize-handle-sw').css({
                'z-index':    '1001',
                'position':   'absolute',
                'bottom':     '0',
                'left':       '0',
                'cursor':     'sw-resize',
                'height':     '25px',
                'width':      '25px',
                'background': '#B94A48'
            });
            $('#crop-box #resize-handle-nw').css({
                'z-index':    '1001',
                'position':   'absolute',
                'top':        '0',
                'left':       '0',
                'cursor':     'nw-resize',
                'height':     '25px',
                'width':      '25px',
                'background': '#B94A48'
            });
            $('#crop-box #resize-handle-ne').css({
                'z-index':    '1001',
                'position':   'absolute',
                'top':        '0',
                'right':      '0',
                'cursor':     'ne-resize',
                'height':     '25px',
                'width':      '25px',
                'background': '#B94A48'
            });
            self.image.css({
                'opacity': '0.40',
                'filter': 'alpha(opacity=40)'
            });
            self.image.parent().css({
                'position': 'relative'
            });

            // line up background with possible scrolled page
            Croppable.moveBackground();

            // crop box initial position and size
            $('#crop-box').offset({
                top:  self.image.offset().top + (self.image.innerHeight() * 0.05),
                left: self.image.offset().left + (self.image.innerWidth() * 0.05)
            });
            $('#crop-box').css({
                'height': (self.image.innerHeight() * 0.90) + 'px',
                'width':  (self.image.innerWidth() * 0.90) + 'px'
            });

            var resizableOptions = {
                containment: self.image,
                handles: options.resizeHandles,
                resize: options.resizeCallback
            };

            // set crop box to be draggable and resizeable
            $('#crop-box').draggable({ containment: self.image })
                          .resizable(resizableOptions);
        },

        // send new image dimensions via post
        crop: function() {
            var height = $('#crop-box').innerHeight();
            var width = $('#crop-box').innerWidth();
            var left = $('#crop-box').position().left - self.image.position().left;
            var top = $('#crop-box').position().top - self.image.position().top;
            var dimString = width + "x" + height + "+" + left + "+" + top;
            Croppable.cropCallback.call(this, dimString);
        },

        // move background when window scrolls
        moveBackground: function() {
            var top = self.image.offset().top - $(document).scrollTop();
            $('#crop-box').css({
                'background-position': self.image.offset().left + 'px ' + top + 'px'
            });
        },

        // default options
        defaults: {
            resizeCallback: function() {},
            resizeHandles: {
                'se': '#resize-handle-se',
                'sw': '#resize-handle-sw',
                'nw': '#resize-handle-nw',
                'ne': '#resize-handle-ne'
            }
        }
    };

    // user end of croppable
    $.fn.croppable = function(options, cropCallback) {
        var options = $.extend(true, {}, Croppable.defaults, options);

        Croppable.init(this, options);
        Croppable.cropCallback = cropCallback;

        $(options.cropSelector).click(Croppable.crop);
        $(window).scroll(function(){
            Croppable.moveBackground();
        });
        return this;
    };

})( jQuery );