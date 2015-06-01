// Include dependencies
var $           = require('jquery');
var FastClick   = require('fastclick');

window.jQuery   = $; // Expose jQuery globally for plugins
                  require('./components/jquery.SvOverlay.js'); // $.fn.overlay
                  require('jquery.easing');

// Components
var ContactForm        = require('./components/ContactForm.js');
var ScrollUpBtn        = require('./components/ScrollUpBtn.js');

// Views
var homePage           = require('./views/HomePage.js');

// App Code
(function(Modernizr, undefined){

  var $win       = $(window);
  var $body      = $(document.body);
  var $header    = $('.header');
  
  var isFirefox   = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  var contactForm      = new ContactForm( $('form#contact') );
  var scrollUpBtn      = new ScrollUpBtn( $('.blurb img')   );

  function initialize() {
    attachHandlers();    
  }

  function attachHandlers() {
    
    $win.on({
      load              : onLoaded,
      resize            : onResize
    }).trigger('resize');

    $('.home-scroll-tickle').on('click', 'a', function(){
      scrollToOffset( getOffsetForSection('#intro') );
      return false;
    });

  }

  function scrollToOffset(offset) {
    $(isFirefox ? 'html' : 'body').animate({ scrollTop: offset }, 800, "easeInOutSine");
  }

  function getOffsetForSection(selector) {
    var $sec = $(selector);
    if(!$sec) return false;
    return $sec.offset()['top'] - (headerIsFixed() ? getHeaderHeight() : 0);
  }

  function onLoaded() {
    if(Modernizr.touch) {
      setTimeout(addTouchSupport, 200);
    }
    
    homePage.init(); // Needs to go here because it does calculations and needs everything to be loaded
  }

  function onResize() {

  }

  function addTouchSupport() {

  }

  /**
   * Returns the visible viewport dimensions
   *
   * @returns {Object} object with height and width properties
   */
  function getViewportDimensions() {
    return {
      height : Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
      width  : Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    }
  }

  /**
   * Returns the visible viewport height
   *
   * @returns {Number}
   */
  function getViewportHeight() {
    return getViewportDimensions()['height'];
  }

  /**
   * Returns the outer height of the header
   *
   * @returns {Number}
   */
  function getHeaderHeight() {
    return $header.get(0).clientHeight;
  }

  /**
   * Returns whether or not the header is fixed since this changes with media queries
   *
   * @returns {Bool}
   */
  function headerIsFixed() {
    return $header.css('position') == 'fixed';
  }

  $( initialize )

})(Modernizr);
