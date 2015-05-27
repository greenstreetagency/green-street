var $     = require('jquery');
var rAF   = require('../components/requestAnimationFrame');
var _     = require('underscore');

var lerp  = require('../math/lerp');
var norm  = require('../math/norm');
var map   = require('../math/map');
var clamp = require('../math/clamp');

var HomePage = function() {

  var _this = this;

  this._requestAnimationFrame = rAF;
  this._BG_SPEED = 0.8; // Speed modifier for the parallax background
  this._SHIFT_MARGIN = 250; // How close to scrolling into the viewport before we start modifying elements
  this._oldScrollTop = 0; // Cache scroll top so we check if the user has scrolled or not
  this.stats = []; // Container for sizing information about the different sections of the homepage

  this.$el = $('body');
  this.$header = $('header');
  this.$sections = this.$el.find('.js--parallax');

  /**
   * Returns the outer height of the header
   *
   * @returns {Number}
   */
  function getHeaderHeight() {
    return _this.$header.get(0).clientHeight;
  }

  /**
   * Returns whether or not the header is fixed since this changes with media queries
   *
   * @returns {Bool}
   */
  function headerIsFixed() {
    return _this.$header.css('position') == 'fixed';
  }

  this.init = function() {

    this.$sections.each(function(i, el){
    
      var $el = $(el);

      this.stats.push({
        $section      : $el,
        $sectionBG    : $el.find('.section-bg'),
        $sectionInner : $el.find('.section-inner')
      });

      $el.css('z-index', i + 1);
    
    }.bind(this));

    this.calculateSizeStats();

    this._requestAnimationFrame.call(window, this.frameCheck.bind(this));

    $(window).on('resize', _.throttle(this.onResize, 50).bind(_this));
  }

  this.getUsableTop = function() {
    return window.innerHeight - (headerIsFixed() ? getHeaderHeight() : 0 );
  }

  this.getUsableScrollTop = function() {
    var t = $(window).scrollTop() + (headerIsFixed() ? getHeaderHeight() : 0 );
    return parseFloat(t.toFixed(2));
  }

  this.calculateSizeStats = function() {
    var e = this.stats;
    for (var i = e.length - 1; i >= 0; i--) {
      var stat    = e[i];
      var $sec    = stat.$section;
      stat.height = $sec.outerHeight();
      stat.top    = $sec.position().top;
    };
  }

  var getShiftYMethod = function(e) {
    if (Modernizr.csstransforms || Modernizr.csstransforms3d) {
        var t = Modernizr.prefixed("transform");
        return function(e, n) {
            e.css(t, "translateY(" + n + ")")
        }
    }
    return function(e, t) {
        e.css({top: t});
    }
  }

  this.shiftEl = getShiftYMethod();

  this.frameCheck = function(){
    var scrollPosition = this.getUsableScrollTop();

    if(scrollPosition != this._oldScrollTop) {

      this._oldScrollTop = scrollPosition;

      for (var i = this.stats.length - 1; i >= 0; i--) {
        var s = this.stats[i];
        var diff = scrollPosition - s.top;

        // if (any part of the section is within the viewport + SHIFT_MARGIN on top and bottom)
        if( diff > -(s.height + this._SHIFT_MARGIN) && diff < s.height + this._SHIFT_MARGIN ) {
          
          // Then ensure the inner part is visible
          s.$sectionInner.css({visibility: 'visible'});
          
          // reset the 'diff' to be clamped between +- the section height
          diff = clamp(diff, -s.height, s.height);

          this.shiftEl(s.$sectionInner, -diff + "px");
          
          // Turns diff into a normalized number between -1 and 1 to use as a shift amount
          diff = map(diff, -s.height, s.height, -1, 1);

          if(diff != s.oldLocalShift) {
            s.oldLocalShift = diff;
            var f = clamp(map(diff, 0, 1, 0, s.height), 0, s.height);
            this.shiftEl(s.$sectionBG, Math.round(f * this._BG_SPEED) + "px");
            
            // var l = lerp(diff < 0.25 ? 0 : diff, 0.25, 1, 0, 0.8);
            // s.sectionCover.css({opacity: 1, visibility: 1 > 0 ? "visible" : "hidden"});
          }
        } else {

          s.$sectionInner.css({visibility: 'hidden'});

        }
      }
    }

    this._requestAnimationFrame.call(window, this.frameCheck.bind(this));
  }

  this.onResize = function() {
    this.calculateSizeStats();
    this.frameCheck();
  }

  return this;

};


module.exports = new HomePage();