require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./components/jquery.SvOverlay.js'); // $.fn.overlay

var HeaderBlurb = require('./components/HeaderBlurb.js');
var ContactForm = require('./components/ContactForm.js');
var ScrollUpBtn = require('./components/ScrollUpBtn.js');

(function($, Modernizr, ScrollMagic, IScroll, TweenMax, TimelineMax, undefined){

  var touchEnabled = Modernizr.touch;

  var $win  = $(window);
  var $doc  = $(document);
  var $body = $(document.body);
  var $header = $('.header');
  var $slides = $('.slide');
  var $scrollContainer = $(touchEnabled ? "#scroll-container" : window);
  var scrollController;
  var scenes = {};
  var touchScroll; // IScroll instance

  var headerBlurb = new HeaderBlurb($('#blurb-text'));
  var contactForm = new ContactForm($('form#contact'));
  var scrollUpBtn = new ScrollUpBtn($('.blurb img'));

  function initialize() {
    initScrollControls();
    onResize();
    $win.on({
      load: onLoaded,
      resize: onResize,
      orientationchange: onOrientationChange
    });
  }

  function onLoaded() {
    if(touchEnabled)
      setTimeout(addTouchSupport, 200);

    Modernizr.pointerevents = true;

    Modernizr.pointerevents || $slides.on("mousewheel DOMMouseScroll", function(e) {
        $scrollContainer.scrollTop($scrollContainer.scrollTop() - (e.originalEvent.wheelDelta || 10 * -e.originalEvent.detail))
    });
  }

  function onResize() {
    adjustSlideDimensions();
    for(var e in scenes) {
      var scene = scenes[e];
      scene.duration( getDurationForScene(e) );
      scene.offset( getOffsetForScene(e) );
    }
  }

  function onOrientationChange() {
    scrollController.update();
  }

  function addTouchSupport() {
    0 != window.scrollY && window.scrollTo(0, 0);

    touchScroll = new IScroll("#scroll-container", {
      scrollX: false,
      scrollY: true,
      scrollbars: true,
      useTransform: false,
      useTransition: false,
      probeType: 3,
      tap: !0,
      click: !0
    });
    scrollController.scrollPos(function() {
      return -touchScroll.y;
    });
    touchScroll.on("scroll", function() {
      scrollController.update()
    }),
    document.addEventListener("touchmove", function(e) {
      e.preventDefault()
    }, !1);

    scrollUpBtn.addTouchSupport(touchScroll);

    // window.touchScroll = touchScroll;
  }

  /**
   *  Returns the outer height of the header
   *
   * @returns {Number}
   */
  function getHeaderHeight() {
    return $header.get(0).clientHeight;
  }

  /**
   * Returns a duration in pixels as the length that the scene will scroll for
   *
   * @param {String} Key identifier for the scene ("home", "branding", etc..)
   * @returns {Number} Different scenes require different scroll durations
   */
  function getDurationForScene(sceneKey) {
    var duration;
    switch(sceneKey) {
      case "branding":
      case "touchPoints":
      case "executions":
        duration = 5;
        break;
      case "process":
        duration = 6; // num slides
        break;
      default:
        duration = 3;
    }

    return duration * window.innerHeight;
  }

  /**
   * Returns the offset for the scene in pixels, changes as the header height changes
   *
   * @param {String} Key identifier for the scene ("home", "branding", etc..)
   * @returns {Number}
   */
  function getOffsetForScene(sceneKey) {
    // var headerHeight = getHeaderHeight();
    return sceneKey == "home" ? 0 : -getHeaderHeight();  //???
    // return -getHeaderHeight();
  }

  /**
   * Adjusts slide height to ensure that they take up the full viewport height minus the header height
   */
  function adjustSlideDimensions() {
    // $slides.height( window.innerHeight - getHeaderHeight() );
    $slides.height( window.innerHeight - getHeaderHeight() );
  }

  // Dictionary for different scene animation styles (home section, about section, process section etc..)
  // used in addSceneAnimationForType;
  var sceneAnimations = {
    home : function( scene ) {
      var blurAmount  = { a : 3 }; // Starts blur at 3px
      var tL          = new TimelineMax();
      var tweenGroup  = [];

      var applyBlur = function() {
        TweenMax.set('.home-bg', {
          webkitFilter : "blur(" + blurAmount.a + "px)"
        })
      }

      TweenMax.set('#home-tagline-2', {
        alpha: 0,
        y: '0%',
        scale: 0.9,
      });

      tweenGroup.push(
        TweenMax.to('#home-tagline-1', 1, {
          alpha: 0,
          y: '-10%'
        })
      );

      if(!touchEnabled){ // Only apply blur tween to non touch browsers, it's intensive
        applyBlur();
        tweenGroup.push(
          TweenMax.to(blurAmount, 1, {
            a : 0,
            onUpdate : applyBlur
          })
        );
      }

      tL
      .add(tweenGroup)
      .add(TweenMax.to('#home-tagline-2', 1, {
        alpha: 1,
        scale: 1
      }, "-=0.5"));

      scene.setTween(tL);

    },
    process : function( scene ) {
      var tL = new TimelineMax();

      var $processStepsInline  = $('.process-step-inline');
      var $processStepsAbs     = $('.process-step-absolute');
      var $processDescriptions = $('.process-step-description');
      var processStepCount     = $processStepsInline.size();

      $processStepsInline.css({'opacity' : 0.1});
      $processStepsAbs.css({'opacity' : 0});
      $processDescriptions.css({'opacity' : 0})

      for (var i = 0; i < processStepCount; i++) {
        var stepInline = $processStepsInline[i];
        var stepAbs = $processStepsAbs[i];
        var stepAbsImg = $(stepAbs).find('img').first();
        var stepDescription = $processDescriptions[i];
        var lastStep = (i == processStepCount - 1);

        var tweenGroups = {
          first  : [],
          second : []
        }

        tweenGroups.first.push(
          TweenMax.to(stepInline, 100, {
            alpha : 1,
          })
        );

        tweenGroups.first.push(
          TweenMax.to(stepDescription, 100, {
            alpha : 1,
          })
        );

        tweenGroups.first.push(
          TweenMax.to(stepAbs, 100, {
            alpha : 1,
          })
        );

        tweenGroups.first.push(
          TweenMax.fromTo(stepAbsImg, 80,
            {
              x: "150%",
              alpha: 0,
              force3D: true
            },
            {
              x: "0%",
              alpha: 1,
              force3D: true
            }
          )
        );

        if(!lastStep){

          tweenGroups.second.push(
            TweenMax.to(stepDescription, 100, {
              alpha : 0,
            })
          );

          tweenGroups.second.push(
            TweenMax.to(stepAbs, 100, {
              alpha : 0,
            })
          );

          tweenGroups.second.push(
            TweenMax.to(stepAbsImg, 80, {
              x: "-150%",
              alpha: 0
            })
          );

        }

        tL
        .add(tweenGroups.first)
        .add(tweenGroups.second, "+=50");
      };

      scene.setTween(tL);

    },
    about : function( scene, opts ) {
      var bgColor = opts.bgColor;
      var $slide  = opts.$slide
      var $slides = $slide.find('.about-step');
      var tL      = new TimelineMax();

      var $first = $slides.first();
      var $remaining = $slides.slice(1);
      var remainingCount = $remaining.size();

      tL.add(TweenMax.to($first.get(0), 1, {
        alpha: 0
      }));

      $remaining
      .css({'opacity' : 0})
      .each(function(i, el){

        var yoyo = (i + 1 != remainingCount);

        tL.add(TweenMax.to(el, 1, {
          alpha: 1,
          yoyo: yoyo,
          repeat: (yoyo ? 1 : 0)
        }));

      });

      tL.add(TweenMax.to($slide.get(0), 1, {
        backgroundColor : bgColor
      }), "-=0.5");

      scene.setTween(tL);
    }
  };

  function addSceneAnimationForType(key, scene, opts) {
    if(sceneAnimations.hasOwnProperty(key))
      sceneAnimations[key].call( this, scene, opts );
  }

  function addSceneAnimations() {

    // Add animations for the home scene
    addSceneAnimationForType( 'home', scenes.home );

    // Branding Section
    addSceneAnimationForType( 'about', scenes.branding, { bgColor : '#55BDE8', $slide : $('#branding.slide')  } );

    // Touch points section
    addSceneAnimationForType( 'about', scenes.touchPoints, { bgColor : '#CA277E', $slide : $('#touch-points.slide')  } );

    // Executions Section
    addSceneAnimationForType( 'about', scenes.executions, { bgColor : '#222', $slide : $('#executions.slide')  } );

    // Add animations for the process scene
    addSceneAnimationForType( 'process', scenes.process );

  }

  function initScrollControls() {

    var headerHeight = getHeaderHeight();

    scrollController = new ScrollMagic.Controller({
      container: $scrollContainer.get(0),
      globalSceneOptions: {
        offset: -headerHeight,
        duration: (window.innerHeight - headerHeight) * 3,
        triggerHook: "onLeave",
        offset: 1 //-headerHeight
      },
      logLevel : 3
    });

    scenes.home = new ScrollMagic.Scene({
      triggerElement: '#home'
    })
    .setPin("#home");

    scenes.branding = new ScrollMagic.Scene({
      triggerElement: '#branding'
    })
    .setPin("#branding");

    scenes.touchPoints = new ScrollMagic.Scene({
      triggerElement: '#touch-points'
    })
    .setPin("#touch-points");

    scenes.executions = new ScrollMagic.Scene({
      triggerElement: '#executions'
    })
    .setPin("#executions");

    scenes.process = new ScrollMagic.Scene({
      triggerElement: '#process'
    })
    .setPin("#process");

    scenes.clients = new ScrollMagic.Scene({
      triggerElement: '#clients'
    });

    scenes.footer = new ScrollMagic.Scene({
      triggerElement: 'footer'
    });

    scrollController.addScene([
      scenes.home,
      scenes.process,
      scenes.branding,
      scenes.touchPoints,
      scenes.executions,
      scenes.clients,
      scenes.footer
    ]);

    addSceneAnimations();
  }

  $(function(){
    initialize();
  });

})(jQuery, Modernizr, ScrollMagic, IScroll, TweenMax, TimelineMax);

},{"./components/ContactForm.js":2,"./components/HeaderBlurb.js":3,"./components/ScrollUpBtn.js":4,"./components/jquery.SvOverlay.js":5}],2:[function(require,module,exports){
ContactForm = function($form){

  var self = this;

  this.$form = $form;

  var $inputEmail   = this.$form.find('[name="email"]');
  var $inputMessage = this.$form.find('[name="message"]');
  var $inputUrl     = this.$form.find('[name="url"]');
  var $inputSubmit  = this.$form.find('input[type="submit"]');

  var inputSubmitDefault = $inputSubmit.val(); // What does the button say when we load the page

  var emailRegex = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$";

  var messages = {
    sending : 'Sending...',
    success : 'Thank you for your message',
    failure : 'Something went wrong, please try again'
  };

  function initialize(){
    // Attach event handlers to the form
    self.$form.on('focus', '[name="email"], [name="message"]', function(){
        $(this).removeClass('error');
    });

    self.$form.on('submit', function(e){
      e.preventDefault();
      self.onSubmit(e);
    });

  };

  this.validateEmail = function() {
    var valid =  ($inputEmail.val().match( emailRegex ) !== null);

    if(!valid) {
      $inputEmail.addClass('error');
    }

    return valid;
  };

  this.validateMessage = function() {
    var msg   = $inputMessage.val();
    var valid = !(!msg || /^\s*$/.test(msg)); // inside parens checks if string is blank

    if(!valid) {
      $inputMessage.addClass('error');
    }

    return valid;
  };

  this.validateForm = function(){
    var messageValid = this.validateMessage();
    var emailValid = this.validateEmail();
    return messageValid && emailValid;
  };

  // Event Handlers
  this.onSubmit = function(e){

    var self = this;

    if( this.validateForm() ){

        var params = {
          email:   $inputEmail.val(),
          message: $inputMessage.val(),
          url:     $inputUrl.val()
        };

        $.ajax({
            url: '/contact.php',
            type: 'POST',
            dataType: 'json',
            data: params,
            beforeSend: self.beforeSend
        })
        .done(function(data) {
          return data['success'] ? self.onSuccess() : self.onFailure();
        })
        .fail( self.onFailure() );
    }
  };

  this.beforeSend = function(){
    $inputSubmit.val( messages.sending ).prop('disabled', 'disabled');
  };

  this.onSuccess = function(){
    $inputSubmit.val( messages.success );

    setTimeout(function(){
        // Close the overlay after 1500ms
        self.$form.parents('.overlay').find('.overlay-close').trigger('click');
        setTimeout(function(){
            // Clear the form 500ms after that
            $inputEmail.val('').removeClass('error');
            $inputMessage.val('').removeClass('error');
            $inputSubmit.val( inputSubmitDefault ).prop('disabled', false);
        }, 500);
    }, 1500);
  };

  this.onFailure = function(){
    $inputSubmit.val( messages.failure ).prop('disabled', false);

    setTimeout(function(){
        $inputSubmit.val( inputSubmitDefault );
    }, 3000);
  };

  // Kick it off
  initialize();

};

module.exports = ContactForm;

},{}],3:[function(require,module,exports){
HeaderBlurb = function($el) {

  var $textEl = $el;

  /**
   * Method for switching the header text
   *
   * @param {String} text - Text to set on the element
   * @param {Number} duration - length (ms) for the entire text change transition to occur (default is 500ms)
   */
  this.switchText = function(text, duration) {
    var d = duration || 100;
        d = d / 2; // split the total duration in half for the two parts of the transition

    $textEl.fadeTo(d, 0, function(){
      this.text(text).fadeTo(d, 1);
    }.bind($textEl));

    return this;
  }

}

module.exports = HeaderBlurb;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
;(function ($) {
  'use strict';

  /* ========================================================================
   * Site overlay content.
   * Handles display, and cleanup
   * ======================================================================== */

  /*
   * Overlay Constructor
   *
   * @constructor
   * @param {DOM node} element - The overlay element, containing all the proper markup and classnames
   * @param {object} options
   */
  var SvOverlay = function (element, options) {
    // this => SvOverlay
    // element => <a href="#contact" data-overlay="#contact-form">contact</a>
    // options => undefined

    this.options        = options;
    this.$body          = $(document.body);
    this.$element       = $(element);
    this.isShown        = !1;

  };

  /**
   * Shows the overlay and adds event listeners
   *
   * @return {self}
   */
  SvOverlay.prototype.show = function(){

    var onComplete = function(){
      this.$element.trigger('focus').trigger('shown.overlay')
    }.bind(this) // this overlay

    var e = $.Event('show.overlay', { target: self.$element });

    this.$element.trigger(e);

    if (this.isShown) return;

    this.isShown = true;

    this.$body.addClass('overlay-open');

    this.escape();

    this.$element.on('click.dismiss.overlay', '.overlay-close', $.proxy(this.hide, this))

    this.enforceFocus();

    this.$element.fadeTo(500, 1, 'swing', onComplete); // 'easeOutQuart'

    this.$element.show();

    return this;

    /*
    this.$element.addClass('open');
    this.isShown = true;
    this.$body.addClass('overlay-open');
    this.$element.on('click', '.overlay-close', $.proxy(this.hide, this));

    var e = $.Event('show.sv.modal');
    this.$element.trigger(e);
    */

  };

  /**
   * Hides the overlay and removes event listeners
   *
   * @return {self}
   */
  SvOverlay.prototype.hide = function(e){

    var onComplete = function(){
      this.$element.hide();
      this.$element.trigger('hidden.overlay');
    }.bind(this);

    if (e) e.preventDefault();

    e = $.Event('hide.overlay');

    this.$element.trigger(e);

    if (!this.isShown) return;

    this.isShown = false;

    this.$body.removeClass('overlay-open');

    this.escape();

    $(document).off('focusin.overlay')

    this.$element.off('click.dismiss.overlay');

    this.$element.fadeTo(500, 0, 'swing', onComplete); // easeInQuart

    return this;

  };

  /**
   * Triggers focus on the overlay allowing us to capture keydown events
   */
   SvOverlay.prototype.enforceFocus = function() {

    $(document)
      .off('focusin.overlay') // guard against infinite focus loop
      .on('focusin.overlay', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this));
  },

  /**
   * Attaches / Removes keydown handler on the overlay that checks if the esc key has been pressed
   * - Hides the overlay if it is displayed and 'esc' has been pressed
   */
  SvOverlay.prototype.escape = function() {
    if (this.isShown) {
      this.$element.on('keydown.dismiss.overlay', $.proxy(function (e) {
        e.which == 27 && this.hide() // esc key
      }, this))
    }
    else {
      this.$element.off('keydown.dismiss.overlay');
    }
  }

  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(_relatedTarget) {
    return this.each(function () {

      var overlay = new SvOverlay(this);

      overlay.show();

    });
  }

  $.fn.svOverlay             = Plugin;
  $.fn.svOverlay.Constructor = SvOverlay;

  // OVERLAY API (no programmatic yet, only clicks)
  // ==============================================
  $(document).on('click', '[data-overlay]', function (e) {
    var $this   = $(this);
    var href    = $this.attr('href');
    var $target = $($this.attr('data-overlay') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // strip for ie7

    if ($this.is('a')) e.preventDefault();

    Plugin.call($target, this);

  });

})(jQuery);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RlZmJvd2VybWFuL0RvY3VtZW50cy9TdHJlZXRWaXJ1cy9HcmVlbiBTdHJlZXQvc2l0ZS9wdWJsaWMvc3JjL2pzL2FwcC5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9Db250YWN0Rm9ybS5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9IZWFkZXJCbHVyYi5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9TY3JvbGxVcEJ0bi5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9qcXVlcnkuU3ZPdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL2NvbXBvbmVudHMvanF1ZXJ5LlN2T3ZlcmxheS5qcycpOyAvLyAkLmZuLm92ZXJsYXlcblxudmFyIEhlYWRlckJsdXJiID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0hlYWRlckJsdXJiLmpzJyk7XG52YXIgQ29udGFjdEZvcm0gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvQ29udGFjdEZvcm0uanMnKTtcbnZhciBTY3JvbGxVcEJ0biA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9TY3JvbGxVcEJ0bi5qcycpO1xuXG4oZnVuY3Rpb24oJCwgTW9kZXJuaXpyLCBTY3JvbGxNYWdpYywgSVNjcm9sbCwgVHdlZW5NYXgsIFRpbWVsaW5lTWF4LCB1bmRlZmluZWQpe1xuXG4gIHZhciB0b3VjaEVuYWJsZWQgPSBNb2Rlcm5penIudG91Y2g7XG5cbiAgdmFyICR3aW4gID0gJCh3aW5kb3cpO1xuICB2YXIgJGRvYyAgPSAkKGRvY3VtZW50KTtcbiAgdmFyICRib2R5ID0gJChkb2N1bWVudC5ib2R5KTtcbiAgdmFyICRoZWFkZXIgPSAkKCcuaGVhZGVyJyk7XG4gIHZhciAkc2xpZGVzID0gJCgnLnNsaWRlJyk7XG4gIHZhciAkc2Nyb2xsQ29udGFpbmVyID0gJCh0b3VjaEVuYWJsZWQgPyBcIiNzY3JvbGwtY29udGFpbmVyXCIgOiB3aW5kb3cpO1xuICB2YXIgc2Nyb2xsQ29udHJvbGxlcjtcbiAgdmFyIHNjZW5lcyA9IHt9O1xuICB2YXIgdG91Y2hTY3JvbGw7IC8vIElTY3JvbGwgaW5zdGFuY2VcblxuICB2YXIgaGVhZGVyQmx1cmIgPSBuZXcgSGVhZGVyQmx1cmIoJCgnI2JsdXJiLXRleHQnKSk7XG4gIHZhciBjb250YWN0Rm9ybSA9IG5ldyBDb250YWN0Rm9ybSgkKCdmb3JtI2NvbnRhY3QnKSk7XG4gIHZhciBzY3JvbGxVcEJ0biA9IG5ldyBTY3JvbGxVcEJ0bigkKCcuYmx1cmIgaW1nJykpO1xuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgaW5pdFNjcm9sbENvbnRyb2xzKCk7XG4gICAgb25SZXNpemUoKTtcbiAgICAkd2luLm9uKHtcbiAgICAgIGxvYWQ6IG9uTG9hZGVkLFxuICAgICAgcmVzaXplOiBvblJlc2l6ZSxcbiAgICAgIG9yaWVudGF0aW9uY2hhbmdlOiBvbk9yaWVudGF0aW9uQ2hhbmdlXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbkxvYWRlZCgpIHtcbiAgICBpZih0b3VjaEVuYWJsZWQpXG4gICAgICBzZXRUaW1lb3V0KGFkZFRvdWNoU3VwcG9ydCwgMjAwKTtcblxuICAgIE1vZGVybml6ci5wb2ludGVyZXZlbnRzID0gdHJ1ZTtcblxuICAgIE1vZGVybml6ci5wb2ludGVyZXZlbnRzIHx8ICRzbGlkZXMub24oXCJtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJHNjcm9sbENvbnRhaW5lci5zY3JvbGxUb3AoJHNjcm9sbENvbnRhaW5lci5zY3JvbGxUb3AoKSAtIChlLm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSB8fCAxMCAqIC1lLm9yaWdpbmFsRXZlbnQuZGV0YWlsKSlcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uUmVzaXplKCkge1xuICAgIGFkanVzdFNsaWRlRGltZW5zaW9ucygpO1xuICAgIGZvcih2YXIgZSBpbiBzY2VuZXMpIHtcbiAgICAgIHZhciBzY2VuZSA9IHNjZW5lc1tlXTtcbiAgICAgIHNjZW5lLmR1cmF0aW9uKCBnZXREdXJhdGlvbkZvclNjZW5lKGUpICk7XG4gICAgICBzY2VuZS5vZmZzZXQoIGdldE9mZnNldEZvclNjZW5lKGUpICk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25PcmllbnRhdGlvbkNoYW5nZSgpIHtcbiAgICBzY3JvbGxDb250cm9sbGVyLnVwZGF0ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVG91Y2hTdXBwb3J0KCkge1xuICAgIDAgIT0gd2luZG93LnNjcm9sbFkgJiYgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuXG4gICAgdG91Y2hTY3JvbGwgPSBuZXcgSVNjcm9sbChcIiNzY3JvbGwtY29udGFpbmVyXCIsIHtcbiAgICAgIHNjcm9sbFg6IGZhbHNlLFxuICAgICAgc2Nyb2xsWTogdHJ1ZSxcbiAgICAgIHNjcm9sbGJhcnM6IHRydWUsXG4gICAgICB1c2VUcmFuc2Zvcm06IGZhbHNlLFxuICAgICAgdXNlVHJhbnNpdGlvbjogZmFsc2UsXG4gICAgICBwcm9iZVR5cGU6IDMsXG4gICAgICB0YXA6ICEwLFxuICAgICAgY2xpY2s6ICEwXG4gICAgfSk7XG4gICAgc2Nyb2xsQ29udHJvbGxlci5zY3JvbGxQb3MoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gLXRvdWNoU2Nyb2xsLnk7XG4gICAgfSk7XG4gICAgdG91Y2hTY3JvbGwub24oXCJzY3JvbGxcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBzY3JvbGxDb250cm9sbGVyLnVwZGF0ZSgpXG4gICAgfSksXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICB9LCAhMSk7XG5cbiAgICBzY3JvbGxVcEJ0bi5hZGRUb3VjaFN1cHBvcnQodG91Y2hTY3JvbGwpO1xuXG4gICAgLy8gd2luZG93LnRvdWNoU2Nyb2xsID0gdG91Y2hTY3JvbGw7XG4gIH1cblxuICAvKipcbiAgICogIFJldHVybnMgdGhlIG91dGVyIGhlaWdodCBvZiB0aGUgaGVhZGVyXG4gICAqXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRIZWFkZXJIZWlnaHQoKSB7XG4gICAgcmV0dXJuICRoZWFkZXIuZ2V0KDApLmNsaWVudEhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZHVyYXRpb24gaW4gcGl4ZWxzIGFzIHRoZSBsZW5ndGggdGhhdCB0aGUgc2NlbmUgd2lsbCBzY3JvbGwgZm9yXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBLZXkgaWRlbnRpZmllciBmb3IgdGhlIHNjZW5lIChcImhvbWVcIiwgXCJicmFuZGluZ1wiLCBldGMuLilcbiAgICogQHJldHVybnMge051bWJlcn0gRGlmZmVyZW50IHNjZW5lcyByZXF1aXJlIGRpZmZlcmVudCBzY3JvbGwgZHVyYXRpb25zXG4gICAqL1xuICBmdW5jdGlvbiBnZXREdXJhdGlvbkZvclNjZW5lKHNjZW5lS2V5KSB7XG4gICAgdmFyIGR1cmF0aW9uO1xuICAgIHN3aXRjaChzY2VuZUtleSkge1xuICAgICAgY2FzZSBcImJyYW5kaW5nXCI6XG4gICAgICBjYXNlIFwidG91Y2hQb2ludHNcIjpcbiAgICAgIGNhc2UgXCJleGVjdXRpb25zXCI6XG4gICAgICAgIGR1cmF0aW9uID0gNTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicHJvY2Vzc1wiOlxuICAgICAgICBkdXJhdGlvbiA9IDY7IC8vIG51bSBzbGlkZXNcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkdXJhdGlvbiA9IDM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGR1cmF0aW9uICogd2luZG93LmlubmVySGVpZ2h0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9mZnNldCBmb3IgdGhlIHNjZW5lIGluIHBpeGVscywgY2hhbmdlcyBhcyB0aGUgaGVhZGVyIGhlaWdodCBjaGFuZ2VzXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBLZXkgaWRlbnRpZmllciBmb3IgdGhlIHNjZW5lIChcImhvbWVcIiwgXCJicmFuZGluZ1wiLCBldGMuLilcbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGZ1bmN0aW9uIGdldE9mZnNldEZvclNjZW5lKHNjZW5lS2V5KSB7XG4gICAgLy8gdmFyIGhlYWRlckhlaWdodCA9IGdldEhlYWRlckhlaWdodCgpO1xuICAgIHJldHVybiBzY2VuZUtleSA9PSBcImhvbWVcIiA/IDAgOiAtZ2V0SGVhZGVySGVpZ2h0KCk7ICAvLz8/P1xuICAgIC8vIHJldHVybiAtZ2V0SGVhZGVySGVpZ2h0KCk7XG4gIH1cblxuICAvKipcbiAgICogQWRqdXN0cyBzbGlkZSBoZWlnaHQgdG8gZW5zdXJlIHRoYXQgdGhleSB0YWtlIHVwIHRoZSBmdWxsIHZpZXdwb3J0IGhlaWdodCBtaW51cyB0aGUgaGVhZGVyIGhlaWdodFxuICAgKi9cbiAgZnVuY3Rpb24gYWRqdXN0U2xpZGVEaW1lbnNpb25zKCkge1xuICAgIC8vICRzbGlkZXMuaGVpZ2h0KCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBnZXRIZWFkZXJIZWlnaHQoKSApO1xuICAgICRzbGlkZXMuaGVpZ2h0KCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBnZXRIZWFkZXJIZWlnaHQoKSApO1xuICB9XG5cbiAgLy8gRGljdGlvbmFyeSBmb3IgZGlmZmVyZW50IHNjZW5lIGFuaW1hdGlvbiBzdHlsZXMgKGhvbWUgc2VjdGlvbiwgYWJvdXQgc2VjdGlvbiwgcHJvY2VzcyBzZWN0aW9uIGV0Yy4uKVxuICAvLyB1c2VkIGluIGFkZFNjZW5lQW5pbWF0aW9uRm9yVHlwZTtcbiAgdmFyIHNjZW5lQW5pbWF0aW9ucyA9IHtcbiAgICBob21lIDogZnVuY3Rpb24oIHNjZW5lICkge1xuICAgICAgdmFyIGJsdXJBbW91bnQgID0geyBhIDogMyB9OyAvLyBTdGFydHMgYmx1ciBhdCAzcHhcbiAgICAgIHZhciB0TCAgICAgICAgICA9IG5ldyBUaW1lbGluZU1heCgpO1xuICAgICAgdmFyIHR3ZWVuR3JvdXAgID0gW107XG5cbiAgICAgIHZhciBhcHBseUJsdXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgVHdlZW5NYXguc2V0KCcuaG9tZS1iZycsIHtcbiAgICAgICAgICB3ZWJraXRGaWx0ZXIgOiBcImJsdXIoXCIgKyBibHVyQW1vdW50LmEgKyBcInB4KVwiXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIFR3ZWVuTWF4LnNldCgnI2hvbWUtdGFnbGluZS0yJywge1xuICAgICAgICBhbHBoYTogMCxcbiAgICAgICAgeTogJzAlJyxcbiAgICAgICAgc2NhbGU6IDAuOSxcbiAgICAgIH0pO1xuXG4gICAgICB0d2Vlbkdyb3VwLnB1c2goXG4gICAgICAgIFR3ZWVuTWF4LnRvKCcjaG9tZS10YWdsaW5lLTEnLCAxLCB7XG4gICAgICAgICAgYWxwaGE6IDAsXG4gICAgICAgICAgeTogJy0xMCUnXG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgICBpZighdG91Y2hFbmFibGVkKXsgLy8gT25seSBhcHBseSBibHVyIHR3ZWVuIHRvIG5vbiB0b3VjaCBicm93c2VycywgaXQncyBpbnRlbnNpdmVcbiAgICAgICAgYXBwbHlCbHVyKCk7XG4gICAgICAgIHR3ZWVuR3JvdXAucHVzaChcbiAgICAgICAgICBUd2Vlbk1heC50byhibHVyQW1vdW50LCAxLCB7XG4gICAgICAgICAgICBhIDogMCxcbiAgICAgICAgICAgIG9uVXBkYXRlIDogYXBwbHlCbHVyXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgdExcbiAgICAgIC5hZGQodHdlZW5Hcm91cClcbiAgICAgIC5hZGQoVHdlZW5NYXgudG8oJyNob21lLXRhZ2xpbmUtMicsIDEsIHtcbiAgICAgICAgYWxwaGE6IDEsXG4gICAgICAgIHNjYWxlOiAxXG4gICAgICB9LCBcIi09MC41XCIpKTtcblxuICAgICAgc2NlbmUuc2V0VHdlZW4odEwpO1xuXG4gICAgfSxcbiAgICBwcm9jZXNzIDogZnVuY3Rpb24oIHNjZW5lICkge1xuICAgICAgdmFyIHRMID0gbmV3IFRpbWVsaW5lTWF4KCk7XG5cbiAgICAgIHZhciAkcHJvY2Vzc1N0ZXBzSW5saW5lICA9ICQoJy5wcm9jZXNzLXN0ZXAtaW5saW5lJyk7XG4gICAgICB2YXIgJHByb2Nlc3NTdGVwc0FicyAgICAgPSAkKCcucHJvY2Vzcy1zdGVwLWFic29sdXRlJyk7XG4gICAgICB2YXIgJHByb2Nlc3NEZXNjcmlwdGlvbnMgPSAkKCcucHJvY2Vzcy1zdGVwLWRlc2NyaXB0aW9uJyk7XG4gICAgICB2YXIgcHJvY2Vzc1N0ZXBDb3VudCAgICAgPSAkcHJvY2Vzc1N0ZXBzSW5saW5lLnNpemUoKTtcblxuICAgICAgJHByb2Nlc3NTdGVwc0lubGluZS5jc3MoeydvcGFjaXR5JyA6IDAuMX0pO1xuICAgICAgJHByb2Nlc3NTdGVwc0Ficy5jc3MoeydvcGFjaXR5JyA6IDB9KTtcbiAgICAgICRwcm9jZXNzRGVzY3JpcHRpb25zLmNzcyh7J29wYWNpdHknIDogMH0pXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvY2Vzc1N0ZXBDb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBzdGVwSW5saW5lID0gJHByb2Nlc3NTdGVwc0lubGluZVtpXTtcbiAgICAgICAgdmFyIHN0ZXBBYnMgPSAkcHJvY2Vzc1N0ZXBzQWJzW2ldO1xuICAgICAgICB2YXIgc3RlcEFic0ltZyA9ICQoc3RlcEFicykuZmluZCgnaW1nJykuZmlyc3QoKTtcbiAgICAgICAgdmFyIHN0ZXBEZXNjcmlwdGlvbiA9ICRwcm9jZXNzRGVzY3JpcHRpb25zW2ldO1xuICAgICAgICB2YXIgbGFzdFN0ZXAgPSAoaSA9PSBwcm9jZXNzU3RlcENvdW50IC0gMSk7XG5cbiAgICAgICAgdmFyIHR3ZWVuR3JvdXBzID0ge1xuICAgICAgICAgIGZpcnN0ICA6IFtdLFxuICAgICAgICAgIHNlY29uZCA6IFtdXG4gICAgICAgIH1cblxuICAgICAgICB0d2Vlbkdyb3Vwcy5maXJzdC5wdXNoKFxuICAgICAgICAgIFR3ZWVuTWF4LnRvKHN0ZXBJbmxpbmUsIDEwMCwge1xuICAgICAgICAgICAgYWxwaGEgOiAxLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdHdlZW5Hcm91cHMuZmlyc3QucHVzaChcbiAgICAgICAgICBUd2Vlbk1heC50byhzdGVwRGVzY3JpcHRpb24sIDEwMCwge1xuICAgICAgICAgICAgYWxwaGEgOiAxLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgdHdlZW5Hcm91cHMuZmlyc3QucHVzaChcbiAgICAgICAgICBUd2Vlbk1heC50byhzdGVwQWJzLCAxMDAsIHtcbiAgICAgICAgICAgIGFscGhhIDogMSxcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHR3ZWVuR3JvdXBzLmZpcnN0LnB1c2goXG4gICAgICAgICAgVHdlZW5NYXguZnJvbVRvKHN0ZXBBYnNJbWcsIDgwLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB4OiBcIjE1MCVcIixcbiAgICAgICAgICAgICAgYWxwaGE6IDAsXG4gICAgICAgICAgICAgIGZvcmNlM0Q6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHg6IFwiMCVcIixcbiAgICAgICAgICAgICAgYWxwaGE6IDEsXG4gICAgICAgICAgICAgIGZvcmNlM0Q6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYoIWxhc3RTdGVwKXtcblxuICAgICAgICAgIHR3ZWVuR3JvdXBzLnNlY29uZC5wdXNoKFxuICAgICAgICAgICAgVHdlZW5NYXgudG8oc3RlcERlc2NyaXB0aW9uLCAxMDAsIHtcbiAgICAgICAgICAgICAgYWxwaGEgOiAwLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgdHdlZW5Hcm91cHMuc2Vjb25kLnB1c2goXG4gICAgICAgICAgICBUd2Vlbk1heC50byhzdGVwQWJzLCAxMDAsIHtcbiAgICAgICAgICAgICAgYWxwaGEgOiAwLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgdHdlZW5Hcm91cHMuc2Vjb25kLnB1c2goXG4gICAgICAgICAgICBUd2Vlbk1heC50byhzdGVwQWJzSW1nLCA4MCwge1xuICAgICAgICAgICAgICB4OiBcIi0xNTAlXCIsXG4gICAgICAgICAgICAgIGFscGhhOiAwXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRMXG4gICAgICAgIC5hZGQodHdlZW5Hcm91cHMuZmlyc3QpXG4gICAgICAgIC5hZGQodHdlZW5Hcm91cHMuc2Vjb25kLCBcIis9NTBcIik7XG4gICAgICB9O1xuXG4gICAgICBzY2VuZS5zZXRUd2Vlbih0TCk7XG5cbiAgICB9LFxuICAgIGFib3V0IDogZnVuY3Rpb24oIHNjZW5lLCBvcHRzICkge1xuICAgICAgdmFyIGJnQ29sb3IgPSBvcHRzLmJnQ29sb3I7XG4gICAgICB2YXIgJHNsaWRlICA9IG9wdHMuJHNsaWRlXG4gICAgICB2YXIgJHNsaWRlcyA9ICRzbGlkZS5maW5kKCcuYWJvdXQtc3RlcCcpO1xuICAgICAgdmFyIHRMICAgICAgPSBuZXcgVGltZWxpbmVNYXgoKTtcblxuICAgICAgdmFyICRmaXJzdCA9ICRzbGlkZXMuZmlyc3QoKTtcbiAgICAgIHZhciAkcmVtYWluaW5nID0gJHNsaWRlcy5zbGljZSgxKTtcbiAgICAgIHZhciByZW1haW5pbmdDb3VudCA9ICRyZW1haW5pbmcuc2l6ZSgpO1xuXG4gICAgICB0TC5hZGQoVHdlZW5NYXgudG8oJGZpcnN0LmdldCgwKSwgMSwge1xuICAgICAgICBhbHBoYTogMFxuICAgICAgfSkpO1xuXG4gICAgICAkcmVtYWluaW5nXG4gICAgICAuY3NzKHsnb3BhY2l0eScgOiAwfSlcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKGksIGVsKXtcblxuICAgICAgICB2YXIgeW95byA9IChpICsgMSAhPSByZW1haW5pbmdDb3VudCk7XG5cbiAgICAgICAgdEwuYWRkKFR3ZWVuTWF4LnRvKGVsLCAxLCB7XG4gICAgICAgICAgYWxwaGE6IDEsXG4gICAgICAgICAgeW95bzogeW95byxcbiAgICAgICAgICByZXBlYXQ6ICh5b3lvID8gMSA6IDApXG4gICAgICAgIH0pKTtcblxuICAgICAgfSk7XG5cbiAgICAgIHRMLmFkZChUd2Vlbk1heC50bygkc2xpZGUuZ2V0KDApLCAxLCB7XG4gICAgICAgIGJhY2tncm91bmRDb2xvciA6IGJnQ29sb3JcbiAgICAgIH0pLCBcIi09MC41XCIpO1xuXG4gICAgICBzY2VuZS5zZXRUd2Vlbih0TCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFkZFNjZW5lQW5pbWF0aW9uRm9yVHlwZShrZXksIHNjZW5lLCBvcHRzKSB7XG4gICAgaWYoc2NlbmVBbmltYXRpb25zLmhhc093blByb3BlcnR5KGtleSkpXG4gICAgICBzY2VuZUFuaW1hdGlvbnNba2V5XS5jYWxsKCB0aGlzLCBzY2VuZSwgb3B0cyApO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU2NlbmVBbmltYXRpb25zKCkge1xuXG4gICAgLy8gQWRkIGFuaW1hdGlvbnMgZm9yIHRoZSBob21lIHNjZW5lXG4gICAgYWRkU2NlbmVBbmltYXRpb25Gb3JUeXBlKCAnaG9tZScsIHNjZW5lcy5ob21lICk7XG5cbiAgICAvLyBCcmFuZGluZyBTZWN0aW9uXG4gICAgYWRkU2NlbmVBbmltYXRpb25Gb3JUeXBlKCAnYWJvdXQnLCBzY2VuZXMuYnJhbmRpbmcsIHsgYmdDb2xvciA6ICcjNTVCREU4JywgJHNsaWRlIDogJCgnI2JyYW5kaW5nLnNsaWRlJykgIH0gKTtcblxuICAgIC8vIFRvdWNoIHBvaW50cyBzZWN0aW9uXG4gICAgYWRkU2NlbmVBbmltYXRpb25Gb3JUeXBlKCAnYWJvdXQnLCBzY2VuZXMudG91Y2hQb2ludHMsIHsgYmdDb2xvciA6ICcjQ0EyNzdFJywgJHNsaWRlIDogJCgnI3RvdWNoLXBvaW50cy5zbGlkZScpICB9ICk7XG5cbiAgICAvLyBFeGVjdXRpb25zIFNlY3Rpb25cbiAgICBhZGRTY2VuZUFuaW1hdGlvbkZvclR5cGUoICdhYm91dCcsIHNjZW5lcy5leGVjdXRpb25zLCB7IGJnQ29sb3IgOiAnIzIyMicsICRzbGlkZSA6ICQoJyNleGVjdXRpb25zLnNsaWRlJykgIH0gKTtcblxuICAgIC8vIEFkZCBhbmltYXRpb25zIGZvciB0aGUgcHJvY2VzcyBzY2VuZVxuICAgIGFkZFNjZW5lQW5pbWF0aW9uRm9yVHlwZSggJ3Byb2Nlc3MnLCBzY2VuZXMucHJvY2VzcyApO1xuXG4gIH1cblxuICBmdW5jdGlvbiBpbml0U2Nyb2xsQ29udHJvbHMoKSB7XG5cbiAgICB2YXIgaGVhZGVySGVpZ2h0ID0gZ2V0SGVhZGVySGVpZ2h0KCk7XG5cbiAgICBzY3JvbGxDb250cm9sbGVyID0gbmV3IFNjcm9sbE1hZ2ljLkNvbnRyb2xsZXIoe1xuICAgICAgY29udGFpbmVyOiAkc2Nyb2xsQ29udGFpbmVyLmdldCgwKSxcbiAgICAgIGdsb2JhbFNjZW5lT3B0aW9uczoge1xuICAgICAgICBvZmZzZXQ6IC1oZWFkZXJIZWlnaHQsXG4gICAgICAgIGR1cmF0aW9uOiAod2luZG93LmlubmVySGVpZ2h0IC0gaGVhZGVySGVpZ2h0KSAqIDMsXG4gICAgICAgIHRyaWdnZXJIb29rOiBcIm9uTGVhdmVcIixcbiAgICAgICAgb2Zmc2V0OiAxIC8vLWhlYWRlckhlaWdodFxuICAgICAgfSxcbiAgICAgIGxvZ0xldmVsIDogM1xuICAgIH0pO1xuXG4gICAgc2NlbmVzLmhvbWUgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjaG9tZSdcbiAgICB9KVxuICAgIC5zZXRQaW4oXCIjaG9tZVwiKTtcblxuICAgIHNjZW5lcy5icmFuZGluZyA9IG5ldyBTY3JvbGxNYWdpYy5TY2VuZSh7XG4gICAgICB0cmlnZ2VyRWxlbWVudDogJyNicmFuZGluZydcbiAgICB9KVxuICAgIC5zZXRQaW4oXCIjYnJhbmRpbmdcIik7XG5cbiAgICBzY2VuZXMudG91Y2hQb2ludHMgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjdG91Y2gtcG9pbnRzJ1xuICAgIH0pXG4gICAgLnNldFBpbihcIiN0b3VjaC1wb2ludHNcIik7XG5cbiAgICBzY2VuZXMuZXhlY3V0aW9ucyA9IG5ldyBTY3JvbGxNYWdpYy5TY2VuZSh7XG4gICAgICB0cmlnZ2VyRWxlbWVudDogJyNleGVjdXRpb25zJ1xuICAgIH0pXG4gICAgLnNldFBpbihcIiNleGVjdXRpb25zXCIpO1xuXG4gICAgc2NlbmVzLnByb2Nlc3MgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjcHJvY2VzcydcbiAgICB9KVxuICAgIC5zZXRQaW4oXCIjcHJvY2Vzc1wiKTtcblxuICAgIHNjZW5lcy5jbGllbnRzID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcbiAgICAgIHRyaWdnZXJFbGVtZW50OiAnI2NsaWVudHMnXG4gICAgfSk7XG5cbiAgICBzY2VuZXMuZm9vdGVyID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcbiAgICAgIHRyaWdnZXJFbGVtZW50OiAnZm9vdGVyJ1xuICAgIH0pO1xuXG4gICAgc2Nyb2xsQ29udHJvbGxlci5hZGRTY2VuZShbXG4gICAgICBzY2VuZXMuaG9tZSxcbiAgICAgIHNjZW5lcy5wcm9jZXNzLFxuICAgICAgc2NlbmVzLmJyYW5kaW5nLFxuICAgICAgc2NlbmVzLnRvdWNoUG9pbnRzLFxuICAgICAgc2NlbmVzLmV4ZWN1dGlvbnMsXG4gICAgICBzY2VuZXMuY2xpZW50cyxcbiAgICAgIHNjZW5lcy5mb290ZXJcbiAgICBdKTtcblxuICAgIGFkZFNjZW5lQW5pbWF0aW9ucygpO1xuICB9XG5cbiAgJChmdW5jdGlvbigpe1xuICAgIGluaXRpYWxpemUoKTtcbiAgfSk7XG5cbn0pKGpRdWVyeSwgTW9kZXJuaXpyLCBTY3JvbGxNYWdpYywgSVNjcm9sbCwgVHdlZW5NYXgsIFRpbWVsaW5lTWF4KTtcbiIsIkNvbnRhY3RGb3JtID0gZnVuY3Rpb24oJGZvcm0pe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLiRmb3JtID0gJGZvcm07XG5cbiAgdmFyICRpbnB1dEVtYWlsICAgPSB0aGlzLiRmb3JtLmZpbmQoJ1tuYW1lPVwiZW1haWxcIl0nKTtcbiAgdmFyICRpbnB1dE1lc3NhZ2UgPSB0aGlzLiRmb3JtLmZpbmQoJ1tuYW1lPVwibWVzc2FnZVwiXScpO1xuICB2YXIgJGlucHV0VXJsICAgICA9IHRoaXMuJGZvcm0uZmluZCgnW25hbWU9XCJ1cmxcIl0nKTtcbiAgdmFyICRpbnB1dFN1Ym1pdCAgPSB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICB2YXIgaW5wdXRTdWJtaXREZWZhdWx0ID0gJGlucHV0U3VibWl0LnZhbCgpOyAvLyBXaGF0IGRvZXMgdGhlIGJ1dHRvbiBzYXkgd2hlbiB3ZSBsb2FkIHRoZSBwYWdlXG5cbiAgdmFyIGVtYWlsUmVnZXggPSBcIl5bYS16QS1aMC05Xy4rLV0rQFthLXpBLVowLTktXStcXC5bYS16QS1aMC05LS5dKyRcIjtcblxuICB2YXIgbWVzc2FnZXMgPSB7XG4gICAgc2VuZGluZyA6ICdTZW5kaW5nLi4uJyxcbiAgICBzdWNjZXNzIDogJ1RoYW5rIHlvdSBmb3IgeW91ciBtZXNzYWdlJyxcbiAgICBmYWlsdXJlIDogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCBwbGVhc2UgdHJ5IGFnYWluJ1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICAvLyBBdHRhY2ggZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGZvcm1cbiAgICBzZWxmLiRmb3JtLm9uKCdmb2N1cycsICdbbmFtZT1cImVtYWlsXCJdLCBbbmFtZT1cIm1lc3NhZ2VcIl0nLCBmdW5jdGlvbigpe1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgIH0pO1xuXG4gICAgc2VsZi4kZm9ybS5vbignc3VibWl0JywgZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLm9uU3VibWl0KGUpO1xuICAgIH0pO1xuXG4gIH07XG5cbiAgdGhpcy52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbGlkID0gICgkaW5wdXRFbWFpbC52YWwoKS5tYXRjaCggZW1haWxSZWdleCApICE9PSBudWxsKTtcblxuICAgIGlmKCF2YWxpZCkge1xuICAgICAgJGlucHV0RW1haWwuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9O1xuXG4gIHRoaXMudmFsaWRhdGVNZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1zZyAgID0gJGlucHV0TWVzc2FnZS52YWwoKTtcbiAgICB2YXIgdmFsaWQgPSAhKCFtc2cgfHwgL15cXHMqJC8udGVzdChtc2cpKTsgLy8gaW5zaWRlIHBhcmVucyBjaGVja3MgaWYgc3RyaW5nIGlzIGJsYW5rXG5cbiAgICBpZighdmFsaWQpIHtcbiAgICAgICRpbnB1dE1lc3NhZ2UuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9O1xuXG4gIHRoaXMudmFsaWRhdGVGb3JtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbWVzc2FnZVZhbGlkID0gdGhpcy52YWxpZGF0ZU1lc3NhZ2UoKTtcbiAgICB2YXIgZW1haWxWYWxpZCA9IHRoaXMudmFsaWRhdGVFbWFpbCgpO1xuICAgIHJldHVybiBtZXNzYWdlVmFsaWQgJiYgZW1haWxWYWxpZDtcbiAgfTtcblxuICAvLyBFdmVudCBIYW5kbGVyc1xuICB0aGlzLm9uU3VibWl0ID0gZnVuY3Rpb24oZSl7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiggdGhpcy52YWxpZGF0ZUZvcm0oKSApe1xuXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgZW1haWw6ICAgJGlucHV0RW1haWwudmFsKCksXG4gICAgICAgICAgbWVzc2FnZTogJGlucHV0TWVzc2FnZS52YWwoKSxcbiAgICAgICAgICB1cmw6ICAgICAkaW5wdXRVcmwudmFsKClcbiAgICAgICAgfTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2NvbnRhY3QucGhwJyxcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBzZWxmLmJlZm9yZVNlbmRcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBkYXRhWydzdWNjZXNzJ10gPyBzZWxmLm9uU3VjY2VzcygpIDogc2VsZi5vbkZhaWx1cmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZhaWwoIHNlbGYub25GYWlsdXJlKCkgKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcbiAgICAkaW5wdXRTdWJtaXQudmFsKCBtZXNzYWdlcy5zZW5kaW5nICkucHJvcCgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgfTtcblxuICB0aGlzLm9uU3VjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgJGlucHV0U3VibWl0LnZhbCggbWVzc2FnZXMuc3VjY2VzcyApO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAvLyBDbG9zZSB0aGUgb3ZlcmxheSBhZnRlciAxNTAwbXNcbiAgICAgICAgc2VsZi4kZm9ybS5wYXJlbnRzKCcub3ZlcmxheScpLmZpbmQoJy5vdmVybGF5LWNsb3NlJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGZvcm0gNTAwbXMgYWZ0ZXIgdGhhdFxuICAgICAgICAgICAgJGlucHV0RW1haWwudmFsKCcnKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgICAgICAgICRpbnB1dE1lc3NhZ2UudmFsKCcnKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgICAgICAgICRpbnB1dFN1Ym1pdC52YWwoIGlucHV0U3VibWl0RGVmYXVsdCApLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9LCA1MDApO1xuICAgIH0sIDE1MDApO1xuICB9O1xuXG4gIHRoaXMub25GYWlsdXJlID0gZnVuY3Rpb24oKXtcbiAgICAkaW5wdXRTdWJtaXQudmFsKCBtZXNzYWdlcy5mYWlsdXJlICkucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRpbnB1dFN1Ym1pdC52YWwoIGlucHV0U3VibWl0RGVmYXVsdCApO1xuICAgIH0sIDMwMDApO1xuICB9O1xuXG4gIC8vIEtpY2sgaXQgb2ZmXG4gIGluaXRpYWxpemUoKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250YWN0Rm9ybTtcbiIsIkhlYWRlckJsdXJiID0gZnVuY3Rpb24oJGVsKSB7XG5cbiAgdmFyICR0ZXh0RWwgPSAkZWw7XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBmb3Igc3dpdGNoaW5nIHRoZSBoZWFkZXIgdGV4dFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCAtIFRleHQgdG8gc2V0IG9uIHRoZSBlbGVtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiAtIGxlbmd0aCAobXMpIGZvciB0aGUgZW50aXJlIHRleHQgY2hhbmdlIHRyYW5zaXRpb24gdG8gb2NjdXIgKGRlZmF1bHQgaXMgNTAwbXMpXG4gICAqL1xuICB0aGlzLnN3aXRjaFRleHQgPSBmdW5jdGlvbih0ZXh0LCBkdXJhdGlvbikge1xuICAgIHZhciBkID0gZHVyYXRpb24gfHwgMTAwO1xuICAgICAgICBkID0gZCAvIDI7IC8vIHNwbGl0IHRoZSB0b3RhbCBkdXJhdGlvbiBpbiBoYWxmIGZvciB0aGUgdHdvIHBhcnRzIG9mIHRoZSB0cmFuc2l0aW9uXG5cbiAgICAkdGV4dEVsLmZhZGVUbyhkLCAwLCBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50ZXh0KHRleHQpLmZhZGVUbyhkLCAxKTtcbiAgICB9LmJpbmQoJHRleHRFbCkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckJsdXJiO1xuIiwiU2Nyb2xsVXBCdG4gPSBmdW5jdGlvbigkZWwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgJGJ0biA9ICRlbDtcblxuICB2YXIgQVVUT19TQ1JPTExfU1BFRUQgPSA4O1xuICB2YXIgdG91Y2hTY3JvbGwgPSAhMTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZHVyYXRpb24gZm9yIHRoZSBzY3JvbGwgdG8gdG9wIGFuaW1hdGlvbiB0byB0YWtlIHBsYWNlZCBiYXNlZCBvbiBob3cgZmFyIGRvd24gdGhlIHBhZ2UgaXMgc2Nyb2xsZWRcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjcm9sbFRvcCAtIGRpc3RhbmNlIChweCkgc2Nyb2xsZWQgZG93biBmcm9tIHRoZSB0b3BcbiAgICogQHJldHVybiB7TnVtYmVyfSBkdXJhdGlvbiAtIE1pbGxpc2VjXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTY3JvbGxUb3BEdXJhdGlvbihzY3JvbGxUb3ApIHtcbiAgICAvLyBkdXJhdGlvbiA9IHNwZWVkIC8gZGlzdGFuY2U7XG4gICAgcmV0dXJuIHNjcm9sbFRvcCAvIEFVVE9fU0NST0xMX1NQRUVEO1xuICB9XG5cbiAgdGhpcy5hZGRUb3VjaFN1cHBvcnQgPSBmdW5jdGlvbihzY3JvbGwpIHtcbiAgICBpZiggc2Nyb2xsIGluc3RhbmNlb2YgSVNjcm9sbCApIHtcbiAgICAgIC8vIHRvdWNoU2Nyb2xsIGlzIHJlYWwgYnVnZ3kgOi0vXG4gICAgICAvLyB0b3VjaFNjcm9sbCA9IHNjcm9sbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byB0b3AsIHJvdGF0ZXMgdGhlIGVsZW1lbnQgYXJvdW5kIHdoaWxlIHRoZSBzY3JvbGwgaGFwcGVuc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCAtIFRleHQgdG8gc2V0IG9uIHRoZSBlbGVtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiAtIGxlbmd0aCAobXMpIGZvciB0aGUgZW50aXJlIHRleHQgY2hhbmdlIHRyYW5zaXRpb24gdG8gb2NjdXIgKGRlZmF1bHQgaXMgNTAwbXMpXG4gICAqL1xuICAgdGhpcy5zY3JvbGxUb1RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICB2YXIgc2Nyb2xsVG9wID0gdG91Y2hTY3JvbGwgPyAtdG91Y2hTY3JvbGwueSA6ICQoJ2JvZHknKS5zY3JvbGxUb3AoKTtcblxuICAgICBpZihzY3JvbGxUb3AgPCAxMDApIHJldHVybjtcblxuICAgICB2YXIgZHVyYXRpb25NcyAgPSBnZXRTY3JvbGxUb3BEdXJhdGlvbiggc2Nyb2xsVG9wICk7XG4gICAgIHZhciBkdXJhdGlvblNlYyA9IChkdXJhdGlvbk1zIC8gMTAwMCk7XG5cbiAgICAgaWYodG91Y2hTY3JvbGwpIHtcbiAgICAgICB0b3VjaFNjcm9sbC5zY3JvbGxUbygwLCAwLCBkdXJhdGlvbk1zKTtcbiAgICAgfVxuICAgICBlbHNlIHtcbiAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICBzY3JvbGxUb3A6IDBcbiAgICAgICAgfSxcbiAgICAgICAgZHVyYXRpb25Nc1xuICAgICAgKTtcbiAgICAgfVxuICAgIFR3ZWVuTWF4LnRvKCRidG4uZ2V0KDApLCBkdXJhdGlvblNlYywge1xuICAgICAgcm90YXRpb246ICctPTM2MCcsXG4gICAgICBlYXNlOiBQb3dlcjIuZWFzZU91dFxuICAgIH0pO1xuICAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgJGJ0bi5jc3Moe1xuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9KVxuICAgIC5hdHRyKCd0aXRsZScsICdTY3JvbGwgVG8gVG9wJylcbiAgICAub24oJ2NsaWNrJywgc2VsZi5zY3JvbGxUb1RvcCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICByZXR1cm4gaW5pdGlhbGl6ZSgpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsVXBCdG47XG4iLCI7KGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICogU2l0ZSBvdmVybGF5IGNvbnRlbnQuXG4gICAqIEhhbmRsZXMgZGlzcGxheSwgYW5kIGNsZWFudXBcbiAgICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgLypcbiAgICogT3ZlcmxheSBDb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtET00gbm9kZX0gZWxlbWVudCAtIFRoZSBvdmVybGF5IGVsZW1lbnQsIGNvbnRhaW5pbmcgYWxsIHRoZSBwcm9wZXIgbWFya3VwIGFuZCBjbGFzc25hbWVzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICB2YXIgU3ZPdmVybGF5ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAvLyB0aGlzID0+IFN2T3ZlcmxheVxuICAgIC8vIGVsZW1lbnQgPT4gPGEgaHJlZj1cIiNjb250YWN0XCIgZGF0YS1vdmVybGF5PVwiI2NvbnRhY3QtZm9ybVwiPmNvbnRhY3Q8L2E+XG4gICAgLy8gb3B0aW9ucyA9PiB1bmRlZmluZWRcblxuICAgIHRoaXMub3B0aW9ucyAgICAgICAgPSBvcHRpb25zO1xuICAgIHRoaXMuJGJvZHkgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAgIHRoaXMuJGVsZW1lbnQgICAgICAgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMuaXNTaG93biAgICAgICAgPSAhMTtcblxuICB9O1xuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgb3ZlcmxheSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnNcbiAgICpcbiAgICogQHJldHVybiB7c2VsZn1cbiAgICovXG4gIFN2T3ZlcmxheS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgb25Db21wbGV0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcignc2hvd24ub3ZlcmxheScpXG4gICAgfS5iaW5kKHRoaXMpIC8vIHRoaXMgb3ZlcmxheVxuXG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93Lm92ZXJsYXknLCB7IHRhcmdldDogc2VsZi4kZWxlbWVudCB9KTtcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKTtcblxuICAgIGlmICh0aGlzLmlzU2hvd24pIHJldHVybjtcblxuICAgIHRoaXMuaXNTaG93biA9IHRydWU7XG5cbiAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdvdmVybGF5LW9wZW4nKTtcblxuICAgIHRoaXMuZXNjYXBlKCk7XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLm92ZXJsYXknLCAnLm92ZXJsYXktY2xvc2UnLCAkLnByb3h5KHRoaXMuaGlkZSwgdGhpcykpXG5cbiAgICB0aGlzLmVuZm9yY2VGb2N1cygpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5mYWRlVG8oNTAwLCAxLCAnc3dpbmcnLCBvbkNvbXBsZXRlKTsgLy8gJ2Vhc2VPdXRRdWFydCdcblxuICAgIHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgICAvKlxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xuICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoJ292ZXJsYXktb3BlbicpO1xuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrJywgJy5vdmVybGF5LWNsb3NlJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKTtcblxuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5zdi5tb2RhbCcpO1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKTtcbiAgICAqL1xuXG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBvdmVybGF5IGFuZCByZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgKi9cbiAgU3ZPdmVybGF5LnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oZSl7XG5cbiAgICB2YXIgb25Db21wbGV0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUoKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLm92ZXJsYXknKTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUub3ZlcmxheScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpO1xuXG4gICAgaWYgKCF0aGlzLmlzU2hvd24pIHJldHVybjtcblxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xuXG4gICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcygnb3ZlcmxheS1vcGVuJyk7XG5cbiAgICB0aGlzLmVzY2FwZSgpO1xuXG4gICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLm92ZXJsYXknKVxuXG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ2NsaWNrLmRpc21pc3Mub3ZlcmxheScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5mYWRlVG8oNTAwLCAwLCAnc3dpbmcnLCBvbkNvbXBsZXRlKTsgLy8gZWFzZUluUXVhcnRcblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGZvY3VzIG9uIHRoZSBvdmVybGF5IGFsbG93aW5nIHVzIHRvIGNhcHR1cmUga2V5ZG93biBldmVudHNcbiAgICovXG4gICBTdk92ZXJsYXkucHJvdG90eXBlLmVuZm9yY2VGb2N1cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgJChkb2N1bWVudClcbiAgICAgIC5vZmYoJ2ZvY3VzaW4ub3ZlcmxheScpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgICAgLm9uKCdmb2N1c2luLm92ZXJsYXknLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJiAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIC8gUmVtb3ZlcyBrZXlkb3duIGhhbmRsZXIgb24gdGhlIG92ZXJsYXkgdGhhdCBjaGVja3MgaWYgdGhlIGVzYyBrZXkgaGFzIGJlZW4gcHJlc3NlZFxuICAgKiAtIEhpZGVzIHRoZSBvdmVybGF5IGlmIGl0IGlzIGRpc3BsYXllZCBhbmQgJ2VzYycgaGFzIGJlZW4gcHJlc3NlZFxuICAgKi9cbiAgU3ZPdmVybGF5LnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3Mub3ZlcmxheScsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKSAvLyBlc2Mga2V5XG4gICAgICB9LCB0aGlzKSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLm92ZXJsYXknKTtcbiAgICB9XG4gIH1cblxuICAvLyBNT0RBTCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgb3ZlcmxheSA9IG5ldyBTdk92ZXJsYXkodGhpcyk7XG5cbiAgICAgIG92ZXJsYXkuc2hvdygpO1xuXG4gICAgfSk7XG4gIH1cblxuICAkLmZuLnN2T3ZlcmxheSAgICAgICAgICAgICA9IFBsdWdpbjtcbiAgJC5mbi5zdk92ZXJsYXkuQ29uc3RydWN0b3IgPSBTdk92ZXJsYXk7XG5cbiAgLy8gT1ZFUkxBWSBBUEkgKG5vIHByb2dyYW1tYXRpYyB5ZXQsIG9ubHkgY2xpY2tzKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbZGF0YS1vdmVybGF5XScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpO1xuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpO1xuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLW92ZXJsYXknKSB8fCAoaHJlZiAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkpOyAvLyBzdHJpcCBmb3IgaWU3XG5cbiAgICBpZiAoJHRoaXMuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgdGhpcyk7XG5cbiAgfSk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
