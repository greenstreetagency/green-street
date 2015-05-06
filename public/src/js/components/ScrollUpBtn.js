ScrollUpBtn = function($el) {
  var self = this;
  var $btn = $el;

  var AUTO_SCROLL_SPEED = 8;
  var touchScroll = !1;

  /**
   * Returns the duration for the scroll to top animation to take placed based on how far down the page is scrolled
   *
   * @param {Number} scrollTop - distance (px) scrolled down from the top
   * @return {Number} duration - Millisec
   */
  function getScrollTopDuration(scrollTop) {
    // duration = speed / distance;
    return scrollTop / AUTO_SCROLL_SPEED;
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
      // touchScroll = scroll;
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
     var scrollTop = touchScroll ? -touchScroll.y : $('body').scrollTop();

     if(scrollTop < 100) return;

     var durationMs  = getScrollTopDuration( scrollTop );
     var durationSec = (durationMs / 1000);

     if(touchScroll) {
       touchScroll.scrollTo(0, 0, durationMs);
     }
     else {
       $('html, body').animate({
         scrollTop: 0
        },
        durationMs
      );
     }
    TweenMax.to($btn.get(0), durationSec, {
      rotation: '-=360',
      ease: Power2.easeOut
    });
   }

  function initialize() {
    $btn.css({
      cursor: 'pointer'
    })
    .attr('title', 'Scroll To Top')
    .on('click', self.scrollToTop);
    return self;
  }

  return initialize();

}

module.exports = ScrollUpBtn;
