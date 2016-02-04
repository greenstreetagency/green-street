var $ = require('jquery');

function LogoGrid($el) {

  var _this = this;

  this.$el = $el;
  this.$frames = null;

  var transitionInterval; // Keep track of the transitioning interval to be able to start and stop the transitions;
  var lastFrameIndex; // Keep track of this to prevent transitioning the same frame over and over;
  var transitionDuration = 4000; // How long to wait between transitions
  var lazyLoadAttribute = 'data-lazy-src'; // Image tag attribute containing the src url of the image

  /* HELPERS */
  function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Checks if an $(<img>) has a 'src' attribute
   * When we lazy load the images, we add the src attribute when we need to load the img
   * @return {bool}
   */
  function isImageLoaded($img){
    var src = $img.attr('src');
    return (typeof attr !== typeof undefined && attr !== false);
  }

  /**
   * Loads an image by setting the src attribute to whatever was in the 'data-lazy-src' attribute
   * @return {null}
   */
  function loadImage($img){
    var src = $img.attr( lazyLoadAttribute );
    $img.attr('src', src);
    $img.removeAttr( lazyLoadAttribute );
  }

  /* CLASS METHODS */

  /**
   * Initializes the grid of logos by setting the $frames property to all frames with more than one image
   * @return {this}
   */
  this._initialize = function(){

    this.$frames = this.$el.find('.logo-frame').filter(function(i) {
      return $(this).children('img').length > 1
    });

    return this;
  };

  /**
   * Gets a random frame from this.$frames, making sure not to return the frame at index specified by the variable 'lastFrameIndex'
   * @return {Object} - jQuery wrapped .logo-frame
   */
  this.getRandomFrameExcludingLast = function(){
    var i = getRandomInt(0, this.$frames.length - 1);
    
    return (i == lastFrameIndex) ? this.getRandomFrameExcludingLast() : $( this.$frames[i] );
  };

  /**
   * Transitions a logo to the next available logo image.
   * Sets the new logo frame index as the 'lastFrameIndex'
   * @return {null}
   */
  this.transitionLogo = function(){
    var $frame   = this.getRandomFrameExcludingLast();
    var $current = $frame.find('img.current');
    var $next    = $current.next().is('img') ? $current.next() : $frame.find('img').first();

    lastFrameIndex = this.$frames.index($frame);

    if(!isImageLoaded($next)){
      loadImage($next);
    }

    $current.fadeOut(1000, function(){
        $current.removeClass('current');
        $next.fadeIn(1000, function(){
            $next.addClass('current');
        });
    });

  };

  /**
   * Starts the transition interval to fade logos in and out
   * @return {this}
   */
  this.startFading = function(){
    transitionInterval = setInterval(_this.transitionLogo.bind(_this), transitionDuration);
    return this;
  };

  /**
   * Stops the transition interval
   * @return {this}
   */
  this.stopFading = function(){
    clearInterval(transitionInterval);
    return this;
  };

  return this._initialize();

};

module.exports = LogoGrid;