/**
 * jQuery UI croppable plugin
 * 
 * https://github.com/EvilScott/jquery-ui-croppable
 * 
 * Customized version with multicrop support
 */
(function( $ )
{
  var self, Croppable;
  
  self = {};
  Croppable = {
    /**
     * Default options
     * 
     * TODO
     */
    defaults: {
    },
    
    /**
     * Initialize the croppable plugin.
     * 
     * - Create container element
     * - Add CSS classes with static css properties
     * - Create cropping handles
     * 
     * @param image The image that should be cropped
     * @param options The configuration object
     */
    init: function( image, options )
    {
      var boxIndex;
    
      self.options = options;
    
      // ------------------------------------------------------------------
      // prepare image
      // ------------------------------------------------------------------
      self.$image = image;
      self.$image.addClass( 'croppable-image' );
      
      self.containerSize = {
        width: self.$image.width(),
        height: self.$image.height()
      };

      self.$container = $('<div/>').addClass( 'croppable-container' );
      self.$container.width( self.containerSize.width );
      self.$container.height( self.containerSize.height );
      
      self.$image.parent().append( self.$container );
      self.$container.append( self.$image );
      
      // ------------------------------------------------------------------
      // Create crop boxes
      // ------------------------------------------------------------------
      boxIndex = 0;
      
      self.boxState = [];
      $.each(
        options.handles,
        function( name, data )
        {
          self.boxState[ boxIndex++ ] = Croppable.createCropBox( name, data );
        }
      );
        
      // activate first cropbox
      Croppable.setBoxFocus( self.boxState[0] );
        
      // ------------------------------------------------------------------
      // Wire preview update event
      // ------------------------------------------------------------------
      self.$image.on(
        'croppable.change',
        function( evt, box, coords )
        {
          // x/y shrink factor 
          var sfx, sfy;
          
          sfx = box.previewSize.width / coords.width;
          sfy = box.previewSize.height / coords.height;
          
          box.$previewImage.css({
            width: sfx * self.containerSize.width + 'px',
            marginLeft: '-' + sfx * coords.left + 'px',
            height: sfy * self.containerSize.height  + 'px',
            marginTop: '-' + sfy * coords.top + 'px'
          });
        }
      );
      
      // ------------------------------------------------------------------
      // Wire focus management
      // ------------------------------------------------------------------
      self.$container.on(
        'click',
        function( evt )
        {
          var xco, yco, $cropbox, pos, containing, cbt, cbl, cbw, cbh, needFocus;
          
          // 1. get current click position
          xco = evt.pageX;
          yco = evt.pageY;
          
          console.log( 'clicked at', xco, yco );
          
          // 2. get boxes which should be included in cycling
          containing = [];
          for( var i = 0, len = self.boxState.length; i < len; i++ )
          {
            $cropbox = self.boxState[i].$cropbox;
            
            pos = $cropbox.offset();
            cbl = pos.left;
            cbt = pos.top;
            cbw = $cropbox.width();
            cbh = $cropbox.height();
            
            console.log( 'cropbox', i, ' rectancle:', cbl, cbt, cbw, cbh );
             
            // clicked within box, consider for cycling 
            if( xco >= cbl && xco <= (cbl+cbw)
             && yco >= cbt && yco <= cbt+cbh )
            {
              console.log( 'cropbox match', i, ' rectancle:', pos.left, pos.top, $cropbox.width(), $cropbox.height() );
              containing.push( self.boxState[i] );
            }
          }
          
          // apply focus to the eligible box
          needFocus = true;
          for( var i = 0, len = containing.length; i < len; i++ )
          {
            if ( containing[i].active )
            {
              needFocus = false;
              
              if( typeof containing[i+1] !== 'undefined' )
              {
                Croppable.setBoxFocus( containing[i+1] );
              }
              else
              {
                Croppable.setBoxFocus( containing[0] );
              }
              
              break;
            }
          }
          
          if( needFocus )
          {
            Croppable.setBoxFocus( containing[0] );
          }
        }
      );
    },
    
    /**
     * Puts the focus on the given box
     * 
     * @param box A box created by Croppable.createCropBox()
     */
    setBoxFocus: function( box )
    {
      $.each(
        self.boxState,
        function( index, box )
        {
          box.active = false;
          box.$cropbox.removeClass( 'active' );
        }
      );
      
      box.active = true;
      box.$cropbox.addClass( 'active' );
    },
    
    /**
     * Create a cropping box
     * 
     * @param name The internal name of the box
     * @param options The box configuration
     * 
     * @return An object with the current box state
     */
    createCropBox: function( name, options )
    {
      var box, $cropbox, size, offset;
      
      box = {};
      
      box.name = name;
      box.options = options;
      
      // ------------------------------------------------------------------
      // create cropping box HTML structure
      // - cropping box
      // - color gobo
      // - cropping handles
      // ------------------------------------------------------------------
      box.$cropbox = $(
        '<div id="croppable-box-' + name + '" class="croppable-box">' +
          '<div class="croppable-box-gobo"></div>' +
          '<div class="ui-resizable-handle ui-resizable-ne"></div>' +
          '<div class="ui-resizable-handle ui-resizable-n"></div>' +
          '<div class="ui-resizable-handle ui-resizable-nw"></div>' +
          '<div class="ui-resizable-handle ui-resizable-w"></div>' +
          '<div class="ui-resizable-handle ui-resizable-sw"></div>' +
          '<div class="ui-resizable-handle ui-resizable-s"></div>' +
          '<div class="ui-resizable-handle ui-resizable-se"></div>' +
          '<div class="ui-resizable-handle ui-resizable-e"></div>' +
          '<div class="croppable-line croppable-hline"></div>' +
          '<div class="croppable-line croppable-hline bottom"></div>' +
          '<div class="croppable-line croppable-vline"></div>' +
          '<div class="croppable-line croppable-vline right"></div>' +
        '</div>'
      );
      
      // ------------------------------------------------------------------
      // Apply dynamic CSS properties
      // ------------------------------------------------------------------
      //box.$cropbox.css( {backgroundImage: 'url("' + self.$image.attr('src') + '")'} );
      $( '.croppable-box-gobo', box.$cropbox ).css( {backgroundColor: options.bgColor} );
      
      // ------------------------------------------------------------------
      // Set initial frame position
      // ------------------------------------------------------------------
      if( options.initialSelection )
      {
        size = {
          width: options.initialSelection.width,
          height: options.initialSelection.height
        };
        
        offset = {
          left: options.initialSelection.left,
          top: options.initialSelection.top
        };
      }
      else
      {
        size = {
          width: options.minSize.width + 'px',
          height: options.minSize.height + 'px'
        };
        
        offset = self.$image.offset();
      }
      
      box.$cropbox.css( size );
      box.$cropbox.offset( offset );
      
      // ------------------------------------------------------------------
      // attach to workspace
      // ------------------------------------------------------------------
      self.$image.parent().append( box.$cropbox );
      box.$cropbox.data( 'croppable-box', box );
      
      // ------------------------------------------------------------------
      // Initialize resizable
      // ------------------------------------------------------------------
      box.$cropbox.resizable({
        containment: self.$image,
        aspectRatio: options.aspectRatio,
        minWidth: options.minSize.width,
        minHeight: options.minSize.height,
        handles: {
          'ne': $( '.ui-resizable-handle.ui-resizable-ne', box.$cropbox ),
          'n': $( '.ui-resizable-handle.ui-resizable-n', box.$cropbox ),
          'nw': $( '.ui-resizable-handle.ui-resizable-nw', box.$cropbox ),
          'w': $( '.ui-resizable-handle.ui-resizable-w', box.$cropbox ),
          'sw': $( '.ui-resizable-handle.ui-resizable-sw', box.$cropbox ),
          's': $( '.ui-resizable-handle.ui-resizable-s', box.$cropbox ),
          'se': $( '.ui-resizable-handle.ui-resizable-se', box.$cropbox ),
          'e': $( '.ui-resizable-handle.ui-resizable-e', box.$cropbox ),
        },
        
        start: function( evt, ui )
        {
          self.$image.trigger( 'croppable.change', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        },
        resize: function( evt, ui )
        {
          self.$image.trigger( 'croppable.change', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        },
        stop: function( evt, ui )
        {
          self.$image.trigger( 'croppable.select', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        }
      });
      
      // ------------------------------------------------------------------
      // Initialize draggable
      // ------------------------------------------------------------------
      box.$cropbox.draggable({
        containment: self.$image,
        
        start: function( evt, ui )
        {
          self.$image.trigger( 'croppable.change', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        },
        drag: function( evt, ui )
        {
          self.$image.trigger( 'croppable.change', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        },
        stop: function( evt, ui )
        {
          self.$image.trigger( 'croppable.select', [box, Croppable.makeCoords( ui.helper, ui.position )] );
        }
      });
      
      // ------------------------------------------------------------------
      // Initialize preview if requested
      // ------------------------------------------------------------------
      if( options.$preview )
      {
        if( !options.previewSize )
        {
          options.previewSize = options.minSize;
        }
        
        box.$previewImage = self.$image.clone().removeClass();
        box.$preview = options.$preview;
        box.previewSize = options.previewSize;
        box.$preview.append(
          $( '<div class="croppable-preview"></div>' )
          .css(
            {
              width: options.previewSize.width,
              height: options.previewSize.height,
              borderColor: options.bgColor
            }
          )
          .append( box.$previewImage )
        );
      }
      
      return box;
    },
    
    /**
     * Creates a coords object from the given data
     * 
     * @param $element The container element for width and height
     * @param position The position object for top and left
     */
    makeCoords: function( $element, position )
    {
      return {
        top: position.top,
        left: position.left,
        width: $element.width(),
        height: $element.height()
      }
    }
  };

  /*
   * user end of croppable
   * 
   * @param options The configuration object
   */
  $.fn.croppable = function( options )
  {
    var options = $.extend( true, {}, Croppable.defaults, options );

    Croppable.init(this, options);

    return this;
  };
})( jQuery );
