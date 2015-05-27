var $ = require('jquery');
var modernizr = window.Modernizr;

ScrollUpBtn = function($el) {
  var self  = this;
  var $btn  = $el;

  var SCROLL_DURATION = 1000;

  var isFirefox   = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  /**
   * Returns the duration for the scroll to top animation to take placed based on how far down the page is scrolled
   *
   * @param {Number} scrollTop - distance (px) scrolled down from the top
   * @return {Number} duration - Millisec
   */
  function getScrollTopDuration(scrollTop) {
    return SCROLL_DURATION;
  }

  /**
   * Returns the distance scrolled down the page
   *
   * @return {Number}
   */
  function getScrollTop() {
    return $(isFirefox ? 'html' : 'body').scrollTop();
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

     $(isFirefox ? 'html' : 'body').animate({
       scrollTop: 0
      },
      durationMs,
      'easeOutCirc'
    );

    if(modernizr.csstransforms) {
      $btn
      .on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(){
        $(this).removeClass('spin-360--once');
      })
      .css('-webkit-animation-duration', durationMs + "ms")
      .addClass('spin-360--once');
    }
   }

  function initialize() {
    $btn.css({
      cursor: 'pointer'
    })
    .attr('title', 'Scroll To Top')
    .on('click', function(e){
      self.scrollToTop();
      return false;
    });
    return self;
  }

  return initialize();

}

module.exports = ScrollUpBtn;
