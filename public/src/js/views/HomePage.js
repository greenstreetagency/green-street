var $      = require('jquery');
var rAF    = require('../components/requestAnimationFrame');
var _      = require('underscore');
var bowser = require('bowser').browser;

var lerp  = require('../math/lerp');
var norm  = require('../math/norm');
var map   = require('../math/map');
var clamp = require('../math/clamp');

var HomePage = function() {

  var _this = this;
  var _initialized = false;

  this._requestAnimationFrame = rAF;
  this._BG_SPEED = 0.8; // Speed modifier for the parallax background
  this._SHIFT_MARGIN = 250; // How close to scrolling into the viewport before we start modifying elements
  this._oldScrollTop = 0; // Cache scroll top so we check if the user has scrolled or not
  this.stats = []; // Container for sizing information about the different sections of the homepage
  this.homestats = {}; // Container for sizing information about the home section
  this.headerstats = {}; // Container for sizing information about the header

  this.$window = $(window);
  this.$el = $('body');
  this.$header = $('header');
  this.$home = $('#home');
  this.$homeTagline = this.$home.find('.home-tagline');
  this.$sections = this.$el.find('.js--parallax');
  this.$fullSizes = this.$el.find('.js--full-screen');


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

  /**
   * Returns the visible viewport dimensions
   *
   * @returns {Object} object with height and width properties
   */
  function getViewportDimensions() {
    var dim = {};

    if (typeof window.innerWidth != 'undefined') {
     dim.width = window.innerWidth;
     dim.height = window.innerHeight;
    }
     else if (typeof document.documentElement != 'undefined' && 
              typeof document.documentElement.clientWidth != 'undefined' &&
              document.documentElement.clientWidth != 0) {
    dim.width = document.documentElement.clientWidth;
    dim.height = document.documentElement.clientHeight;
   }
   else {
    dim.width = document.getElementsByTagName('body')[0].clientWidth;
    dim.height = document.getElementsByTagName('body')[0].clientHeight;
   }

   return dim;

  }

  /**
   * Returns the visible viewport height
   *
   * @returns {Number}
   */
  function getViewportHeight() {
    return getViewportDimensions()['height'];
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

    var f = function(){
      _.throttle(_this.onResize, 50).bind(_this);
    }

    this.$window.on('resize', _this.onResize.bind(_this));
    this.$window.on('orientationchange', _this.onOrientationChange.bind(_this));

    this.onResize();

    this._requestAnimationFrame.call(window, this.frameCheck.bind(this));

     _initialized = true;

  }

  this.getUsableTop = function() {
    return window.innerHeight - (this.headerstats.fixed ? this.headerstats.height : 0 );
  }

  this.getUsableScrollTop = function() {
    var t = this.$window.scrollTop() + (this.headerstats.fixed ? this.headerstats.height : 0 );
    return parseFloat(t.toFixed(2));
  }

  this.fullScreen = function() {
    var viewportHeight = getViewportHeight();
    var newHeight      = viewportHeight - (this.headerstats.fixed ? this.headerstats.height : 0) + 1;

    this.$fullSizes.height(newHeight);
    this.$home.height(viewportHeight - (this.headerstats.fixed ? 0 : this.headerstats.height));
  }

  this.calculateSizeStats = function() {
    var e = this.stats;
    for (var i = e.length - 1; i >= 0; i--) {
      var stat    = e[i];
      var $sec    = stat.$section;
      stat.height = $sec.outerHeight();
      stat.top    = $sec.position().top;
    }

    this.headerstats.fixed = headerIsFixed();
    this.headerstats.height = getHeaderHeight();

    this.homestats.top = this.$home.offset()['top'];
    this.homestats.height = this.$home.outerHeight();
    this.homestats.taglineHeight = this.$homeTagline.height();
  }

  var getShiftYMethod = function(e) {
    if (Modernizr.csstransforms3d && (!e || !e.skip3D)) {
        var t = Modernizr.prefixed("transform");
        return function(e, n) {
            // var r = e.css(t);
            // var i = r.match(/-?[0-9\.]+/g);
            // if (!i)
            //     return;
            // shiftX = i[i.length > 6 ? 13 : 4], e.css(t, "translate3D(" + shiftX + "px, " + n + ", 0)")
            e.css(t, "translate3D(0, " + n + ", 0)")
        }
    }
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

  this.shiftY = getShiftYMethod();

  this.frameCheck = function(force){
    var scrollPosition = this.getUsableScrollTop();

    if(scrollPosition != this._oldScrollTop || force == true) {

      this._oldScrollTop = scrollPosition;

      var l = this.stats.length;
      var s, diff;
      for (var i = 0; i < l; i++) {
        s    = this.stats[i];
        diff = scrollPosition - s.top;

        // if (any part of the section is within the viewport + SHIFT_MARGIN on top and bottom)
        if( diff > -(s.height + this._SHIFT_MARGIN) && diff < s.height + this._SHIFT_MARGIN ) {
          
          var diffReduced = diff - (this.headerstats.fixed ? this.headerstats.height : 0);

          // Then ensure the inner part is visible
          s.$sectionInner.css({visibility: 'visible'});
          
          // reset the 'diff' to be clamped between +- the section height
          diff = clamp(diff, -s.height, s.height);

          this.shiftY(s.$sectionInner, - diffReduced + "px");
          
          // Turns diff into a normalized number between -1 and 1 to use as a shift amount
          diff = map(diff, -s.height, s.height, -1, 1);

          if(diff != s.oldLocalShift) {
            s.oldLocalShift = diff;
            var f = clamp(map(diff, 0, 1, 0, s.height + this.headerstats.height), 0, s.height);
            this.shiftY(s.$sectionBG, Math.round(f * this._BG_SPEED) + "px");
          }
        } else {
          s.$sectionInner.css({visibility: 'hidden'});
        }
      }

      // Home tagline parallax
      var num = (scrollPosition - this.homestats.top) / this.homestats.height;
      var scale = clamp(num, 0, 1).toFixed(4);

      this.shiftY(this.$homeTagline, (this.homestats.taglineHeight * scale) + "px");

      this.$homeTagline.css('opacity', Math.abs(scale - 1));

    }

    this._requestAnimationFrame.call(window, this.frameCheck.bind(this));
  }

  this.resetSizing = function() {
    this.fullScreen();
    this.calculateSizeStats();
    this.frameCheck(!0);
  }

  this.onResize = function() {
    if(bowser.ios == true && _initialized) {
      // Only resize once on mobile safari to avoid constant resizing due to the hiding and showing of the address / bookmark bars
      return;
    }
    this.resetSizing();
  }

  this.onOrientationChange = function() {
    this.resetSizing();
  }

  return this;

};


module.exports = new HomePage();