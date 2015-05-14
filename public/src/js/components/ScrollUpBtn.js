var $ = require('jquery');
var IScroll     = require('iscroll-probe');

ScrollUpBtn = function($el) {
  var self  = this;
  var $btn  = $el;

  var SCROLL_DURATION = 1000;

  // var AUTO_SCROLL_SPEED = 8;
  var isFirefox   = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  var touchScroll = !1;

  /**
   * Returns the duration for the scroll to top animation to take placed based on how far down the page is scrolled
   *
   * @param {Number} scrollTop - distance (px) scrolled down from the top
   * @return {Number} duration - Millisec
   */
  function getScrollTopDuration(scrollTop) {
    // scrollTop / AUTO_SCROLL_SPEED;
    return SCROLL_DURATION;
  }

  /**
   * Returns the distance scrolled down the page
   *
   * @return {Number}
   */
  function getScrollTop() {
    return touchScroll ? -touchScroll.y : $(isFirefox ? 'html' : 'body').scrollTop();
  }

  /**
   * Add touch support to the button because touch screens use a scrollable element instead of the body
   *
   * @param {IScroll} scroll
   * @return {self}
   */
  this.addTouchSupport = function(scroll) {
    if( scroll instanceof IScroll ) {
      // touchScroll is real buggy :-/
      touchScroll = scroll;
    }
    return this;
  }

  /**
   * Scrolls to top, rotates the element around while the scroll happens
   *
   * @param {String} text - Text to set on the element
   * @param {Number} duration - length (ms) for the entire text change transition to occur (default is 500ms)
   */
   this.scrollToTop = function() {
     var scrollTop = getScrollTop();

     if(scrollTop < 100) return;

     var durationMs  = getScrollTopDuration( scrollTop );

     if(touchScroll) {
       touchScroll.scrollTo(0, 0, durationMs);
     }
     else {
       console.log('scroll to top');
       $(isFirefox ? 'html' : 'body').animate({
         scrollTop: 0
        },
        durationMs,
        'easeInOutCirc'
      );
     }
    TweenMax.to($btn.get(0), (durationMs / 1000), {
      rotation : '-=360',
      ease     : Power2.easeOut
    });
   }

  function initialize() {
    $btn.css({
      cursor: 'pointer'
    })
    .attr('title', 'Scroll To Top')
    .on('click', function(e){
      console.log('button clicked');
      self.scrollToTop();
      return false;
    });
    return self;
  }

  return initialize();

}

module.exports = ScrollUpBtn;
