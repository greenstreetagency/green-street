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
    var headerHeight = getHeaderHeight();
    return -headerHeight; //(e == "home") ? 0 : -headerHeight; ???
  }

  /**
   * Adjusts slide height to ensure that they take up the full viewport height minus the header height
   */
  function adjustSlideDimensions() {
    $slides.height( window.innerHeight - getHeaderHeight() );
  }

  function addSceneAnimations() {
    // Home Section
    var blurAmount = { a : 3 };
    var tL = new TimelineMax();

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

    var firstStageTweens = [];
        firstStageTweens.push(TweenMax.to('#home-tagline-1', 1, {
          alpha: 0,
          y: '-10%'
        }));

    if(!touchEnabled){
      // Only apply blur tween to non touch browsers, it's intensive
      applyBlur();
      firstStageTweens.push(TweenMax.to(blurAmount, 1, {
        a : 0,
        onUpdate : applyBlur
      }))
    }

    tL.add(firstStageTweens)
    .add(TweenMax.to('#home-tagline-2', 1, {
      alpha: 1,
      scale: 1
    }, "-=0.5"));

    scenes.home.setTween(tL);

    // Branding Section

    var $brandSlide = $('#branding.slide');
    var $brandSlideSteps = $brandSlide.find('.about-step');
    var tL = new TimelineMax();

    var $first = $brandSlideSteps.first();
    var $notFirst = $brandSlideSteps.not($first);

    tL.add(TweenMax.to($first.get(0), 1, {
      alpha: 0
    }));

    $notFirst.css({'opacity' : 0})
    $notFirst.each(function(i, el){
      // console.log((i != $notFirst.size() - 1));
      var yoyo = (i != $notFirst.size() - 1);
      var repeat = yoyo ? 1 : 0
      tL.add(TweenMax.to(el, 1, {
        alpha: 1,
        repeat: repeat,
        yoyo: yoyo
      }))
    });

    tL.add(TweenMax.to($brandSlide.get(0), 1, {
      backgroundColor : '#55BDE8'
    }), "-=0.5");

    scenes.branding.setTween(tL);

    // Touch points section

    var $touchpointsSlide = $('#touch-points.slide');
    var $touchpointsSlideSteps = $touchpointsSlide.find('.about-step');
    var tL = new TimelineMax();

    var $first = $touchpointsSlideSteps.first();
    var $notFirst = $touchpointsSlideSteps.not($first);

    tL.add(TweenMax.to($first.get(0), 1, {
      alpha: 0
    }));

    $notFirst.css({'opacity' : 0})
    $notFirst.each(function(i, el){
      // console.log((i != $notFirst.size() - 1));
      var yoyo = (i != $notFirst.size() - 1);
      var repeat = yoyo ? 1 : 0
      tL.add(TweenMax.to(el, 1, {
        alpha: 1,
        repeat: repeat,
        yoyo: yoyo
      }))
    });

    tL.add(TweenMax.to($('#touch-points.slide').get(0), 1, {
      backgroundColor : '#CA277E'
    }));

    scenes.touchPoints.setTween(tL);

    // Executions Section

    var $executionsSlide = $('#executions.slide');
    var $executionsSlideSteps = $executionsSlide.find('.about-step');
    var tL = new TimelineMax();

    var $first = $executionsSlideSteps.first();
    var $notFirst = $executionsSlideSteps.not($first);

    tL.add(TweenMax.to($first.get(0), 1, {
      alpha: 0
    }));

    $notFirst.css({'opacity' : 0})
    $notFirst.each(function(i, el){
      // console.log((i != $notFirst.size() - 1));
      var yoyo = (i != $notFirst.size() - 1);
      var repeat = yoyo ? 1 : 0
      tL.add(TweenMax.to(el, 1, {
        alpha: 1,
        repeat: repeat,
        yoyo: yoyo
      }))
    });

    tL.add(TweenMax.to($executionsSlide.get(0), 1, {
      backgroundColor : '#222'
    }));

    scenes.executions.setTween(tL);

    // Process Section

    var tL = new TimelineMax();

    var $processStepsInline  = $('.process-step-inline');
    var $processStepsAbs     = $('.process-step-absolute');
    var $processDescriptions = $('.process-step-description');
    var processStepCount     = $processStepsInline.size();

    // tL.add(TweenMax.to($processStepsInline[i], 1, {
    //   alpha: 0
    // }));

    $processStepsInline.css({'opacity' : 0.1});
    $processStepsAbs.css({'opacity' : 0});
    $processDescriptions.css({'opacity' : 0})

    for (var i = 0; i < processStepCount; i++) {
      var stepInline = $processStepsInline[i];
      var stepAbs = $processStepsAbs[i];
      var stepAbsImg = $(stepAbs).find('img').first();
      var stepDescription = $processDescriptions[i];
      var lastStep = (i == processStepCount - 1);
      var yoyo = (i != processStepCount - 1);
      var repeat = yoyo ? 1 : 0;

      var tweens = [];

      var stageOneTweens = [];
      var stageTwoTweens = [];

      stageOneTweens.push(TweenMax.to(stepInline, 100, {
        alpha : 1,
      }));

      stageOneTweens.push(TweenMax.to(stepDescription, 100, {
        alpha : 1,
      }));

      stageOneTweens.push(TweenMax.to(stepAbs, 100, {
        alpha : 1,
      }));

      stageOneTweens.push(TweenMax.fromTo(stepAbsImg, 80, {
        x: "150%",
        alpha: 0,
        force3D: true
      }, {
        x: "0%",
        alpha: 1,
        force3D: true
      }));

      tL.add(stageOneTweens);

      if(!lastStep){

        stageTwoTweens.push(TweenMax.to(stepDescription, 100, {
          alpha : 0,
        }));

        stageTwoTweens.push(TweenMax.to(stepAbs, 100, {
          alpha : 0,
        }));

        stageTwoTweens.push(TweenMax.to(stepAbsImg, 80, {
          x: "-150%",
          alpha: 0
        }));

      }

      tL.add(stageTwoTweens, "+=50");
    };
    scenes.process.setTween(tL);
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
    .setPin("#executions")
    // .on("end", function() {
    //     $("#executions").addClass("slide--fixed")
    // })
    // .on("start", function() {
    //     $("#executions").removeClass("slide--fixed")
    // });

    scenes.process = new ScrollMagic.Scene({
      triggerElement: '#process'
    })
    .setPin("#process");

    scenes.clients = new ScrollMagic.Scene({
      triggerElement: '#clients'
    })
    // .setPin("#clients");

    scenes.footer = new ScrollMagic.Scene({
      triggerElement: 'footer'
    })

    scrollController.addScene([
      scenes.home,
      scenes.process,
      scenes.branding,
      scenes.touchPoints,
      scenes.executions,
      scenes.clients,
      scenes.footer
    ]);
    // window.s = scrollController;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RlZmJvd2VybWFuL0RvY3VtZW50cy9TdHJlZXRWaXJ1cy9HcmVlbiBTdHJlZXQvc2l0ZS9wdWJsaWMvc3JjL2pzL2FwcC5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9Db250YWN0Rm9ybS5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9IZWFkZXJCbHVyYi5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9TY3JvbGxVcEJ0bi5qcyIsIi9Vc2Vycy9zdGVmYm93ZXJtYW4vRG9jdW1lbnRzL1N0cmVldFZpcnVzL0dyZWVuIFN0cmVldC9zaXRlL3B1YmxpYy9zcmMvanMvY29tcG9uZW50cy9qcXVlcnkuU3ZPdmVybGF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSgnLi9jb21wb25lbnRzL2pxdWVyeS5Tdk92ZXJsYXkuanMnKTsgLy8gJC5mbi5vdmVybGF5XG5cbnZhciBIZWFkZXJCbHVyYiA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9IZWFkZXJCbHVyYi5qcycpO1xudmFyIENvbnRhY3RGb3JtID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0NvbnRhY3RGb3JtLmpzJyk7XG52YXIgU2Nyb2xsVXBCdG4gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU2Nyb2xsVXBCdG4uanMnKTtcblxuKGZ1bmN0aW9uKCQsIE1vZGVybml6ciwgU2Nyb2xsTWFnaWMsIElTY3JvbGwsIFR3ZWVuTWF4LCBUaW1lbGluZU1heCwgdW5kZWZpbmVkKXtcblxuICB2YXIgdG91Y2hFbmFibGVkID0gTW9kZXJuaXpyLnRvdWNoO1xuXG4gIHZhciAkd2luICA9ICQod2luZG93KTtcbiAgdmFyICRkb2MgID0gJChkb2N1bWVudCk7XG4gIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSk7XG4gIHZhciAkaGVhZGVyID0gJCgnLmhlYWRlcicpO1xuICB2YXIgJHNsaWRlcyA9ICQoJy5zbGlkZScpO1xuICB2YXIgJHNjcm9sbENvbnRhaW5lciA9ICQodG91Y2hFbmFibGVkID8gXCIjc2Nyb2xsLWNvbnRhaW5lclwiIDogd2luZG93KTtcbiAgdmFyIHNjcm9sbENvbnRyb2xsZXI7XG4gIHZhciBzY2VuZXMgPSB7fTtcbiAgdmFyIHRvdWNoU2Nyb2xsOyAvLyBJU2Nyb2xsIGluc3RhbmNlXG5cbiAgdmFyIGhlYWRlckJsdXJiID0gbmV3IEhlYWRlckJsdXJiKCQoJyNibHVyYi10ZXh0JykpO1xuICB2YXIgY29udGFjdEZvcm0gPSBuZXcgQ29udGFjdEZvcm0oJCgnZm9ybSNjb250YWN0JykpO1xuICB2YXIgc2Nyb2xsVXBCdG4gPSBuZXcgU2Nyb2xsVXBCdG4oJCgnLmJsdXJiIGltZycpKTtcblxuICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgIGluaXRTY3JvbGxDb250cm9scygpO1xuICAgIG9uUmVzaXplKCk7XG4gICAgJHdpbi5vbih7XG4gICAgICBsb2FkOiBvbkxvYWRlZCxcbiAgICAgIHJlc2l6ZTogb25SZXNpemUsXG4gICAgICBvcmllbnRhdGlvbmNoYW5nZTogb25PcmllbnRhdGlvbkNoYW5nZVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Mb2FkZWQoKSB7XG4gICAgaWYodG91Y2hFbmFibGVkKVxuICAgICAgc2V0VGltZW91dChhZGRUb3VjaFN1cHBvcnQsIDIwMCk7XG5cbiAgICBNb2Rlcm5penIucG9pbnRlcmV2ZW50cyA9IHRydWU7XG5cbiAgICBNb2Rlcm5penIucG9pbnRlcmV2ZW50cyB8fCAkc2xpZGVzLm9uKFwibW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbFwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICRzY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKCRzY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKCkgLSAoZS5vcmlnaW5hbEV2ZW50LndoZWVsRGVsdGEgfHwgMTAgKiAtZS5vcmlnaW5hbEV2ZW50LmRldGFpbCkpXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvblJlc2l6ZSgpIHtcbiAgICBhZGp1c3RTbGlkZURpbWVuc2lvbnMoKTtcbiAgICBmb3IodmFyIGUgaW4gc2NlbmVzKSB7XG4gICAgICB2YXIgc2NlbmUgPSBzY2VuZXNbZV07XG4gICAgICBzY2VuZS5kdXJhdGlvbiggZ2V0RHVyYXRpb25Gb3JTY2VuZShlKSApO1xuICAgICAgc2NlbmUub2Zmc2V0KCBnZXRPZmZzZXRGb3JTY2VuZShlKSApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uT3JpZW50YXRpb25DaGFuZ2UoKSB7XG4gICAgc2Nyb2xsQ29udHJvbGxlci51cGRhdGUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRvdWNoU3VwcG9ydCgpIHtcbiAgICAwICE9IHdpbmRvdy5zY3JvbGxZICYmIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcblxuICAgIHRvdWNoU2Nyb2xsID0gbmV3IElTY3JvbGwoXCIjc2Nyb2xsLWNvbnRhaW5lclwiLCB7XG4gICAgICBzY3JvbGxYOiBmYWxzZSxcbiAgICAgIHNjcm9sbFk6IHRydWUsXG4gICAgICBzY3JvbGxiYXJzOiB0cnVlLFxuICAgICAgdXNlVHJhbnNmb3JtOiBmYWxzZSxcbiAgICAgIHVzZVRyYW5zaXRpb246IGZhbHNlLFxuICAgICAgcHJvYmVUeXBlOiAzLFxuICAgICAgdGFwOiAhMCxcbiAgICAgIGNsaWNrOiAhMFxuICAgIH0pO1xuICAgIHNjcm9sbENvbnRyb2xsZXIuc2Nyb2xsUG9zKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIC10b3VjaFNjcm9sbC55O1xuICAgIH0pO1xuICAgIHRvdWNoU2Nyb2xsLm9uKFwic2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgc2Nyb2xsQ29udHJvbGxlci51cGRhdGUoKVxuICAgIH0pLFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSwgITEpO1xuXG4gICAgc2Nyb2xsVXBCdG4uYWRkVG91Y2hTdXBwb3J0KHRvdWNoU2Nyb2xsKTtcblxuICAgIC8vIHdpbmRvdy50b3VjaFNjcm9sbCA9IHRvdWNoU2Nyb2xsO1xuICB9XG5cbiAgLyoqXG4gICAqICBSZXR1cm5zIHRoZSBvdXRlciBoZWlnaHQgb2YgdGhlIGhlYWRlclxuICAgKlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0SGVhZGVySGVpZ2h0KCkge1xuICAgIHJldHVybiAkaGVhZGVyLmdldCgwKS5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGR1cmF0aW9uIGluIHBpeGVscyBhcyB0aGUgbGVuZ3RoIHRoYXQgdGhlIHNjZW5lIHdpbGwgc2Nyb2xsIGZvclxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gS2V5IGlkZW50aWZpZXIgZm9yIHRoZSBzY2VuZSAoXCJob21lXCIsIFwiYnJhbmRpbmdcIiwgZXRjLi4pXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IERpZmZlcmVudCBzY2VuZXMgcmVxdWlyZSBkaWZmZXJlbnQgc2Nyb2xsIGR1cmF0aW9uc1xuICAgKi9cbiAgZnVuY3Rpb24gZ2V0RHVyYXRpb25Gb3JTY2VuZShzY2VuZUtleSkge1xuICAgIHZhciBkdXJhdGlvbjtcbiAgICBzd2l0Y2goc2NlbmVLZXkpIHtcbiAgICAgIGNhc2UgXCJicmFuZGluZ1wiOlxuICAgICAgY2FzZSBcInRvdWNoUG9pbnRzXCI6XG4gICAgICBjYXNlIFwiZXhlY3V0aW9uc1wiOlxuICAgICAgICBkdXJhdGlvbiA9IDU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInByb2Nlc3NcIjpcbiAgICAgICAgZHVyYXRpb24gPSA2OyAvLyBudW0gc2xpZGVzXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHVyYXRpb24gPSAzO1xuICAgIH1cblxuICAgIHJldHVybiBkdXJhdGlvbiAqIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvZmZzZXQgZm9yIHRoZSBzY2VuZSBpbiBwaXhlbHMsIGNoYW5nZXMgYXMgdGhlIGhlYWRlciBoZWlnaHQgY2hhbmdlc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gS2V5IGlkZW50aWZpZXIgZm9yIHRoZSBzY2VuZSAoXCJob21lXCIsIFwiYnJhbmRpbmdcIiwgZXRjLi4pXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBmdW5jdGlvbiBnZXRPZmZzZXRGb3JTY2VuZShzY2VuZUtleSkge1xuICAgIHZhciBoZWFkZXJIZWlnaHQgPSBnZXRIZWFkZXJIZWlnaHQoKTtcbiAgICByZXR1cm4gLWhlYWRlckhlaWdodDsgLy8oZSA9PSBcImhvbWVcIikgPyAwIDogLWhlYWRlckhlaWdodDsgPz8/XG4gIH1cblxuICAvKipcbiAgICogQWRqdXN0cyBzbGlkZSBoZWlnaHQgdG8gZW5zdXJlIHRoYXQgdGhleSB0YWtlIHVwIHRoZSBmdWxsIHZpZXdwb3J0IGhlaWdodCBtaW51cyB0aGUgaGVhZGVyIGhlaWdodFxuICAgKi9cbiAgZnVuY3Rpb24gYWRqdXN0U2xpZGVEaW1lbnNpb25zKCkge1xuICAgICRzbGlkZXMuaGVpZ2h0KCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBnZXRIZWFkZXJIZWlnaHQoKSApO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU2NlbmVBbmltYXRpb25zKCkge1xuICAgIC8vIEhvbWUgU2VjdGlvblxuICAgIHZhciBibHVyQW1vdW50ID0geyBhIDogMyB9O1xuICAgIHZhciB0TCA9IG5ldyBUaW1lbGluZU1heCgpO1xuXG4gICAgdmFyIGFwcGx5Qmx1ciA9IGZ1bmN0aW9uKCkge1xuICAgICAgVHdlZW5NYXguc2V0KCcuaG9tZS1iZycsIHtcbiAgICAgICAgd2Via2l0RmlsdGVyIDogXCJibHVyKFwiICsgYmx1ckFtb3VudC5hICsgXCJweClcIlxuICAgICAgfSlcbiAgICB9XG5cbiAgICBUd2Vlbk1heC5zZXQoJyNob21lLXRhZ2xpbmUtMicsIHtcbiAgICAgIGFscGhhOiAwLFxuICAgICAgeTogJzAlJyxcbiAgICAgIHNjYWxlOiAwLjksXG4gICAgfSk7XG5cbiAgICB2YXIgZmlyc3RTdGFnZVR3ZWVucyA9IFtdO1xuICAgICAgICBmaXJzdFN0YWdlVHdlZW5zLnB1c2goVHdlZW5NYXgudG8oJyNob21lLXRhZ2xpbmUtMScsIDEsIHtcbiAgICAgICAgICBhbHBoYTogMCxcbiAgICAgICAgICB5OiAnLTEwJSdcbiAgICAgICAgfSkpO1xuXG4gICAgaWYoIXRvdWNoRW5hYmxlZCl7XG4gICAgICAvLyBPbmx5IGFwcGx5IGJsdXIgdHdlZW4gdG8gbm9uIHRvdWNoIGJyb3dzZXJzLCBpdCdzIGludGVuc2l2ZVxuICAgICAgYXBwbHlCbHVyKCk7XG4gICAgICBmaXJzdFN0YWdlVHdlZW5zLnB1c2goVHdlZW5NYXgudG8oYmx1ckFtb3VudCwgMSwge1xuICAgICAgICBhIDogMCxcbiAgICAgICAgb25VcGRhdGUgOiBhcHBseUJsdXJcbiAgICAgIH0pKVxuICAgIH1cblxuICAgIHRMLmFkZChmaXJzdFN0YWdlVHdlZW5zKVxuICAgIC5hZGQoVHdlZW5NYXgudG8oJyNob21lLXRhZ2xpbmUtMicsIDEsIHtcbiAgICAgIGFscGhhOiAxLFxuICAgICAgc2NhbGU6IDFcbiAgICB9LCBcIi09MC41XCIpKTtcblxuICAgIHNjZW5lcy5ob21lLnNldFR3ZWVuKHRMKTtcblxuICAgIC8vIEJyYW5kaW5nIFNlY3Rpb25cblxuICAgIHZhciAkYnJhbmRTbGlkZSA9ICQoJyNicmFuZGluZy5zbGlkZScpO1xuICAgIHZhciAkYnJhbmRTbGlkZVN0ZXBzID0gJGJyYW5kU2xpZGUuZmluZCgnLmFib3V0LXN0ZXAnKTtcbiAgICB2YXIgdEwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblxuICAgIHZhciAkZmlyc3QgPSAkYnJhbmRTbGlkZVN0ZXBzLmZpcnN0KCk7XG4gICAgdmFyICRub3RGaXJzdCA9ICRicmFuZFNsaWRlU3RlcHMubm90KCRmaXJzdCk7XG5cbiAgICB0TC5hZGQoVHdlZW5NYXgudG8oJGZpcnN0LmdldCgwKSwgMSwge1xuICAgICAgYWxwaGE6IDBcbiAgICB9KSk7XG5cbiAgICAkbm90Rmlyc3QuY3NzKHsnb3BhY2l0eScgOiAwfSlcbiAgICAkbm90Rmlyc3QuZWFjaChmdW5jdGlvbihpLCBlbCl7XG4gICAgICAvLyBjb25zb2xlLmxvZygoaSAhPSAkbm90Rmlyc3Quc2l6ZSgpIC0gMSkpO1xuICAgICAgdmFyIHlveW8gPSAoaSAhPSAkbm90Rmlyc3Quc2l6ZSgpIC0gMSk7XG4gICAgICB2YXIgcmVwZWF0ID0geW95byA/IDEgOiAwXG4gICAgICB0TC5hZGQoVHdlZW5NYXgudG8oZWwsIDEsIHtcbiAgICAgICAgYWxwaGE6IDEsXG4gICAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgICB5b3lvOiB5b3lvXG4gICAgICB9KSlcbiAgICB9KTtcblxuICAgIHRMLmFkZChUd2Vlbk1heC50bygkYnJhbmRTbGlkZS5nZXQoMCksIDEsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvciA6ICcjNTVCREU4J1xuICAgIH0pLCBcIi09MC41XCIpO1xuXG4gICAgc2NlbmVzLmJyYW5kaW5nLnNldFR3ZWVuKHRMKTtcblxuICAgIC8vIFRvdWNoIHBvaW50cyBzZWN0aW9uXG5cbiAgICB2YXIgJHRvdWNocG9pbnRzU2xpZGUgPSAkKCcjdG91Y2gtcG9pbnRzLnNsaWRlJyk7XG4gICAgdmFyICR0b3VjaHBvaW50c1NsaWRlU3RlcHMgPSAkdG91Y2hwb2ludHNTbGlkZS5maW5kKCcuYWJvdXQtc3RlcCcpO1xuICAgIHZhciB0TCA9IG5ldyBUaW1lbGluZU1heCgpO1xuXG4gICAgdmFyICRmaXJzdCA9ICR0b3VjaHBvaW50c1NsaWRlU3RlcHMuZmlyc3QoKTtcbiAgICB2YXIgJG5vdEZpcnN0ID0gJHRvdWNocG9pbnRzU2xpZGVTdGVwcy5ub3QoJGZpcnN0KTtcblxuICAgIHRMLmFkZChUd2Vlbk1heC50bygkZmlyc3QuZ2V0KDApLCAxLCB7XG4gICAgICBhbHBoYTogMFxuICAgIH0pKTtcblxuICAgICRub3RGaXJzdC5jc3MoeydvcGFjaXR5JyA6IDB9KVxuICAgICRub3RGaXJzdC5lYWNoKGZ1bmN0aW9uKGksIGVsKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKChpICE9ICRub3RGaXJzdC5zaXplKCkgLSAxKSk7XG4gICAgICB2YXIgeW95byA9IChpICE9ICRub3RGaXJzdC5zaXplKCkgLSAxKTtcbiAgICAgIHZhciByZXBlYXQgPSB5b3lvID8gMSA6IDBcbiAgICAgIHRMLmFkZChUd2Vlbk1heC50byhlbCwgMSwge1xuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgcmVwZWF0OiByZXBlYXQsXG4gICAgICAgIHlveW86IHlveW9cbiAgICAgIH0pKVxuICAgIH0pO1xuXG4gICAgdEwuYWRkKFR3ZWVuTWF4LnRvKCQoJyN0b3VjaC1wb2ludHMuc2xpZGUnKS5nZXQoMCksIDEsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvciA6ICcjQ0EyNzdFJ1xuICAgIH0pKTtcblxuICAgIHNjZW5lcy50b3VjaFBvaW50cy5zZXRUd2Vlbih0TCk7XG5cbiAgICAvLyBFeGVjdXRpb25zIFNlY3Rpb25cblxuICAgIHZhciAkZXhlY3V0aW9uc1NsaWRlID0gJCgnI2V4ZWN1dGlvbnMuc2xpZGUnKTtcbiAgICB2YXIgJGV4ZWN1dGlvbnNTbGlkZVN0ZXBzID0gJGV4ZWN1dGlvbnNTbGlkZS5maW5kKCcuYWJvdXQtc3RlcCcpO1xuICAgIHZhciB0TCA9IG5ldyBUaW1lbGluZU1heCgpO1xuXG4gICAgdmFyICRmaXJzdCA9ICRleGVjdXRpb25zU2xpZGVTdGVwcy5maXJzdCgpO1xuICAgIHZhciAkbm90Rmlyc3QgPSAkZXhlY3V0aW9uc1NsaWRlU3RlcHMubm90KCRmaXJzdCk7XG5cbiAgICB0TC5hZGQoVHdlZW5NYXgudG8oJGZpcnN0LmdldCgwKSwgMSwge1xuICAgICAgYWxwaGE6IDBcbiAgICB9KSk7XG5cbiAgICAkbm90Rmlyc3QuY3NzKHsnb3BhY2l0eScgOiAwfSlcbiAgICAkbm90Rmlyc3QuZWFjaChmdW5jdGlvbihpLCBlbCl7XG4gICAgICAvLyBjb25zb2xlLmxvZygoaSAhPSAkbm90Rmlyc3Quc2l6ZSgpIC0gMSkpO1xuICAgICAgdmFyIHlveW8gPSAoaSAhPSAkbm90Rmlyc3Quc2l6ZSgpIC0gMSk7XG4gICAgICB2YXIgcmVwZWF0ID0geW95byA/IDEgOiAwXG4gICAgICB0TC5hZGQoVHdlZW5NYXgudG8oZWwsIDEsIHtcbiAgICAgICAgYWxwaGE6IDEsXG4gICAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgICB5b3lvOiB5b3lvXG4gICAgICB9KSlcbiAgICB9KTtcblxuICAgIHRMLmFkZChUd2Vlbk1heC50bygkZXhlY3V0aW9uc1NsaWRlLmdldCgwKSwgMSwge1xuICAgICAgYmFja2dyb3VuZENvbG9yIDogJyMyMjInXG4gICAgfSkpO1xuXG4gICAgc2NlbmVzLmV4ZWN1dGlvbnMuc2V0VHdlZW4odEwpO1xuXG4gICAgLy8gUHJvY2VzcyBTZWN0aW9uXG5cbiAgICB2YXIgdEwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblxuICAgIHZhciAkcHJvY2Vzc1N0ZXBzSW5saW5lICA9ICQoJy5wcm9jZXNzLXN0ZXAtaW5saW5lJyk7XG4gICAgdmFyICRwcm9jZXNzU3RlcHNBYnMgICAgID0gJCgnLnByb2Nlc3Mtc3RlcC1hYnNvbHV0ZScpO1xuICAgIHZhciAkcHJvY2Vzc0Rlc2NyaXB0aW9ucyA9ICQoJy5wcm9jZXNzLXN0ZXAtZGVzY3JpcHRpb24nKTtcbiAgICB2YXIgcHJvY2Vzc1N0ZXBDb3VudCAgICAgPSAkcHJvY2Vzc1N0ZXBzSW5saW5lLnNpemUoKTtcblxuICAgIC8vIHRMLmFkZChUd2Vlbk1heC50bygkcHJvY2Vzc1N0ZXBzSW5saW5lW2ldLCAxLCB7XG4gICAgLy8gICBhbHBoYTogMFxuICAgIC8vIH0pKTtcblxuICAgICRwcm9jZXNzU3RlcHNJbmxpbmUuY3NzKHsnb3BhY2l0eScgOiAwLjF9KTtcbiAgICAkcHJvY2Vzc1N0ZXBzQWJzLmNzcyh7J29wYWNpdHknIDogMH0pO1xuICAgICRwcm9jZXNzRGVzY3JpcHRpb25zLmNzcyh7J29wYWNpdHknIDogMH0pXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2Nlc3NTdGVwQ291bnQ7IGkrKykge1xuICAgICAgdmFyIHN0ZXBJbmxpbmUgPSAkcHJvY2Vzc1N0ZXBzSW5saW5lW2ldO1xuICAgICAgdmFyIHN0ZXBBYnMgPSAkcHJvY2Vzc1N0ZXBzQWJzW2ldO1xuICAgICAgdmFyIHN0ZXBBYnNJbWcgPSAkKHN0ZXBBYnMpLmZpbmQoJ2ltZycpLmZpcnN0KCk7XG4gICAgICB2YXIgc3RlcERlc2NyaXB0aW9uID0gJHByb2Nlc3NEZXNjcmlwdGlvbnNbaV07XG4gICAgICB2YXIgbGFzdFN0ZXAgPSAoaSA9PSBwcm9jZXNzU3RlcENvdW50IC0gMSk7XG4gICAgICB2YXIgeW95byA9IChpICE9IHByb2Nlc3NTdGVwQ291bnQgLSAxKTtcbiAgICAgIHZhciByZXBlYXQgPSB5b3lvID8gMSA6IDA7XG5cbiAgICAgIHZhciB0d2VlbnMgPSBbXTtcblxuICAgICAgdmFyIHN0YWdlT25lVHdlZW5zID0gW107XG4gICAgICB2YXIgc3RhZ2VUd29Ud2VlbnMgPSBbXTtcblxuICAgICAgc3RhZ2VPbmVUd2VlbnMucHVzaChUd2Vlbk1heC50byhzdGVwSW5saW5lLCAxMDAsIHtcbiAgICAgICAgYWxwaGEgOiAxLFxuICAgICAgfSkpO1xuXG4gICAgICBzdGFnZU9uZVR3ZWVucy5wdXNoKFR3ZWVuTWF4LnRvKHN0ZXBEZXNjcmlwdGlvbiwgMTAwLCB7XG4gICAgICAgIGFscGhhIDogMSxcbiAgICAgIH0pKTtcblxuICAgICAgc3RhZ2VPbmVUd2VlbnMucHVzaChUd2Vlbk1heC50byhzdGVwQWJzLCAxMDAsIHtcbiAgICAgICAgYWxwaGEgOiAxLFxuICAgICAgfSkpO1xuXG4gICAgICBzdGFnZU9uZVR3ZWVucy5wdXNoKFR3ZWVuTWF4LmZyb21UbyhzdGVwQWJzSW1nLCA4MCwge1xuICAgICAgICB4OiBcIjE1MCVcIixcbiAgICAgICAgYWxwaGE6IDAsXG4gICAgICAgIGZvcmNlM0Q6IHRydWVcbiAgICAgIH0sIHtcbiAgICAgICAgeDogXCIwJVwiLFxuICAgICAgICBhbHBoYTogMSxcbiAgICAgICAgZm9yY2UzRDogdHJ1ZVxuICAgICAgfSkpO1xuXG4gICAgICB0TC5hZGQoc3RhZ2VPbmVUd2VlbnMpO1xuXG4gICAgICBpZighbGFzdFN0ZXApe1xuXG4gICAgICAgIHN0YWdlVHdvVHdlZW5zLnB1c2goVHdlZW5NYXgudG8oc3RlcERlc2NyaXB0aW9uLCAxMDAsIHtcbiAgICAgICAgICBhbHBoYSA6IDAsXG4gICAgICAgIH0pKTtcblxuICAgICAgICBzdGFnZVR3b1R3ZWVucy5wdXNoKFR3ZWVuTWF4LnRvKHN0ZXBBYnMsIDEwMCwge1xuICAgICAgICAgIGFscGhhIDogMCxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHN0YWdlVHdvVHdlZW5zLnB1c2goVHdlZW5NYXgudG8oc3RlcEFic0ltZywgODAsIHtcbiAgICAgICAgICB4OiBcIi0xNTAlXCIsXG4gICAgICAgICAgYWxwaGE6IDBcbiAgICAgICAgfSkpO1xuXG4gICAgICB9XG5cbiAgICAgIHRMLmFkZChzdGFnZVR3b1R3ZWVucywgXCIrPTUwXCIpO1xuICAgIH07XG4gICAgc2NlbmVzLnByb2Nlc3Muc2V0VHdlZW4odEwpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFNjcm9sbENvbnRyb2xzKCkge1xuXG4gICAgdmFyIGhlYWRlckhlaWdodCA9IGdldEhlYWRlckhlaWdodCgpO1xuXG4gICAgc2Nyb2xsQ29udHJvbGxlciA9IG5ldyBTY3JvbGxNYWdpYy5Db250cm9sbGVyKHtcbiAgICAgIGNvbnRhaW5lcjogJHNjcm9sbENvbnRhaW5lci5nZXQoMCksXG4gICAgICBnbG9iYWxTY2VuZU9wdGlvbnM6IHtcbiAgICAgICAgb2Zmc2V0OiAtaGVhZGVySGVpZ2h0LFxuICAgICAgICBkdXJhdGlvbjogKHdpbmRvdy5pbm5lckhlaWdodCAtIGhlYWRlckhlaWdodCkgKiAzLFxuICAgICAgICB0cmlnZ2VySG9vazogXCJvbkxlYXZlXCIsXG4gICAgICAgIG9mZnNldDogMSAvLy1oZWFkZXJIZWlnaHRcbiAgICAgIH0sXG4gICAgICBsb2dMZXZlbCA6IDNcbiAgICB9KTtcblxuICAgIHNjZW5lcy5ob21lID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcbiAgICAgIHRyaWdnZXJFbGVtZW50OiAnI2hvbWUnXG4gICAgfSlcbiAgICAuc2V0UGluKFwiI2hvbWVcIik7XG5cbiAgICBzY2VuZXMuYnJhbmRpbmcgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjYnJhbmRpbmcnXG4gICAgfSlcbiAgICAuc2V0UGluKFwiI2JyYW5kaW5nXCIpO1xuXG4gICAgc2NlbmVzLnRvdWNoUG9pbnRzID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcbiAgICAgIHRyaWdnZXJFbGVtZW50OiAnI3RvdWNoLXBvaW50cydcbiAgICB9KVxuICAgIC5zZXRQaW4oXCIjdG91Y2gtcG9pbnRzXCIpO1xuXG4gICAgc2NlbmVzLmV4ZWN1dGlvbnMgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjZXhlY3V0aW9ucydcbiAgICB9KVxuICAgIC5zZXRQaW4oXCIjZXhlY3V0aW9uc1wiKVxuICAgIC8vIC5vbihcImVuZFwiLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgJChcIiNleGVjdXRpb25zXCIpLmFkZENsYXNzKFwic2xpZGUtLWZpeGVkXCIpXG4gICAgLy8gfSlcbiAgICAvLyAub24oXCJzdGFydFwiLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgJChcIiNleGVjdXRpb25zXCIpLnJlbW92ZUNsYXNzKFwic2xpZGUtLWZpeGVkXCIpXG4gICAgLy8gfSk7XG5cbiAgICBzY2VuZXMucHJvY2VzcyA9IG5ldyBTY3JvbGxNYWdpYy5TY2VuZSh7XG4gICAgICB0cmlnZ2VyRWxlbWVudDogJyNwcm9jZXNzJ1xuICAgIH0pXG4gICAgLnNldFBpbihcIiNwcm9jZXNzXCIpO1xuXG4gICAgc2NlbmVzLmNsaWVudHMgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICcjY2xpZW50cydcbiAgICB9KVxuICAgIC8vIC5zZXRQaW4oXCIjY2xpZW50c1wiKTtcblxuICAgIHNjZW5lcy5mb290ZXIgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgdHJpZ2dlckVsZW1lbnQ6ICdmb290ZXInXG4gICAgfSlcblxuICAgIHNjcm9sbENvbnRyb2xsZXIuYWRkU2NlbmUoW1xuICAgICAgc2NlbmVzLmhvbWUsXG4gICAgICBzY2VuZXMucHJvY2VzcyxcbiAgICAgIHNjZW5lcy5icmFuZGluZyxcbiAgICAgIHNjZW5lcy50b3VjaFBvaW50cyxcbiAgICAgIHNjZW5lcy5leGVjdXRpb25zLFxuICAgICAgc2NlbmVzLmNsaWVudHMsXG4gICAgICBzY2VuZXMuZm9vdGVyXG4gICAgXSk7XG4gICAgLy8gd2luZG93LnMgPSBzY3JvbGxDb250cm9sbGVyO1xuICAgIGFkZFNjZW5lQW5pbWF0aW9ucygpO1xuICB9XG5cbiAgJChmdW5jdGlvbigpe1xuICAgIGluaXRpYWxpemUoKTtcbiAgfSk7XG5cbn0pKGpRdWVyeSwgTW9kZXJuaXpyLCBTY3JvbGxNYWdpYywgSVNjcm9sbCwgVHdlZW5NYXgsIFRpbWVsaW5lTWF4KTtcbiIsIkNvbnRhY3RGb3JtID0gZnVuY3Rpb24oJGZvcm0pe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLiRmb3JtID0gJGZvcm07XG5cbiAgdmFyICRpbnB1dEVtYWlsICAgPSB0aGlzLiRmb3JtLmZpbmQoJ1tuYW1lPVwiZW1haWxcIl0nKTtcbiAgdmFyICRpbnB1dE1lc3NhZ2UgPSB0aGlzLiRmb3JtLmZpbmQoJ1tuYW1lPVwibWVzc2FnZVwiXScpO1xuICB2YXIgJGlucHV0VXJsICAgICA9IHRoaXMuJGZvcm0uZmluZCgnW25hbWU9XCJ1cmxcIl0nKTtcbiAgdmFyICRpbnB1dFN1Ym1pdCAgPSB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICB2YXIgaW5wdXRTdWJtaXREZWZhdWx0ID0gJGlucHV0U3VibWl0LnZhbCgpOyAvLyBXaGF0IGRvZXMgdGhlIGJ1dHRvbiBzYXkgd2hlbiB3ZSBsb2FkIHRoZSBwYWdlXG5cbiAgdmFyIGVtYWlsUmVnZXggPSBcIl5bYS16QS1aMC05Xy4rLV0rQFthLXpBLVowLTktXStcXC5bYS16QS1aMC05LS5dKyRcIjtcblxuICB2YXIgbWVzc2FnZXMgPSB7XG4gICAgc2VuZGluZyA6ICdTZW5kaW5nLi4uJyxcbiAgICBzdWNjZXNzIDogJ1RoYW5rIHlvdSBmb3IgeW91ciBtZXNzYWdlJyxcbiAgICBmYWlsdXJlIDogJ1NvbWV0aGluZyB3ZW50IHdyb25nLCBwbGVhc2UgdHJ5IGFnYWluJ1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKXtcbiAgICAvLyBBdHRhY2ggZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGZvcm1cbiAgICBzZWxmLiRmb3JtLm9uKCdmb2N1cycsICdbbmFtZT1cImVtYWlsXCJdLCBbbmFtZT1cIm1lc3NhZ2VcIl0nLCBmdW5jdGlvbigpe1xuICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdlcnJvcicpO1xuICAgIH0pO1xuXG4gICAgc2VsZi4kZm9ybS5vbignc3VibWl0JywgZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLm9uU3VibWl0KGUpO1xuICAgIH0pO1xuXG4gIH07XG5cbiAgdGhpcy52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbGlkID0gICgkaW5wdXRFbWFpbC52YWwoKS5tYXRjaCggZW1haWxSZWdleCApICE9PSBudWxsKTtcblxuICAgIGlmKCF2YWxpZCkge1xuICAgICAgJGlucHV0RW1haWwuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9O1xuXG4gIHRoaXMudmFsaWRhdGVNZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1zZyAgID0gJGlucHV0TWVzc2FnZS52YWwoKTtcbiAgICB2YXIgdmFsaWQgPSAhKCFtc2cgfHwgL15cXHMqJC8udGVzdChtc2cpKTsgLy8gaW5zaWRlIHBhcmVucyBjaGVja3MgaWYgc3RyaW5nIGlzIGJsYW5rXG5cbiAgICBpZighdmFsaWQpIHtcbiAgICAgICRpbnB1dE1lc3NhZ2UuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9O1xuXG4gIHRoaXMudmFsaWRhdGVGb3JtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbWVzc2FnZVZhbGlkID0gdGhpcy52YWxpZGF0ZU1lc3NhZ2UoKTtcbiAgICB2YXIgZW1haWxWYWxpZCA9IHRoaXMudmFsaWRhdGVFbWFpbCgpO1xuICAgIHJldHVybiBtZXNzYWdlVmFsaWQgJiYgZW1haWxWYWxpZDtcbiAgfTtcblxuICAvLyBFdmVudCBIYW5kbGVyc1xuICB0aGlzLm9uU3VibWl0ID0gZnVuY3Rpb24oZSl7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiggdGhpcy52YWxpZGF0ZUZvcm0oKSApe1xuXG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgZW1haWw6ICAgJGlucHV0RW1haWwudmFsKCksXG4gICAgICAgICAgbWVzc2FnZTogJGlucHV0TWVzc2FnZS52YWwoKSxcbiAgICAgICAgICB1cmw6ICAgICAkaW5wdXRVcmwudmFsKClcbiAgICAgICAgfTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2NvbnRhY3QucGhwJyxcbiAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBzZWxmLmJlZm9yZVNlbmRcbiAgICAgICAgfSlcbiAgICAgICAgLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBkYXRhWydzdWNjZXNzJ10gPyBzZWxmLm9uU3VjY2VzcygpIDogc2VsZi5vbkZhaWx1cmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmZhaWwoIHNlbGYub25GYWlsdXJlKCkgKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5iZWZvcmVTZW5kID0gZnVuY3Rpb24oKXtcbiAgICAkaW5wdXRTdWJtaXQudmFsKCBtZXNzYWdlcy5zZW5kaW5nICkucHJvcCgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgfTtcblxuICB0aGlzLm9uU3VjY2VzcyA9IGZ1bmN0aW9uKCl7XG4gICAgJGlucHV0U3VibWl0LnZhbCggbWVzc2FnZXMuc3VjY2VzcyApO1xuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAvLyBDbG9zZSB0aGUgb3ZlcmxheSBhZnRlciAxNTAwbXNcbiAgICAgICAgc2VsZi4kZm9ybS5wYXJlbnRzKCcub3ZlcmxheScpLmZpbmQoJy5vdmVybGF5LWNsb3NlJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGZvcm0gNTAwbXMgYWZ0ZXIgdGhhdFxuICAgICAgICAgICAgJGlucHV0RW1haWwudmFsKCcnKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgICAgICAgICRpbnB1dE1lc3NhZ2UudmFsKCcnKS5yZW1vdmVDbGFzcygnZXJyb3InKTtcbiAgICAgICAgICAgICRpbnB1dFN1Ym1pdC52YWwoIGlucHV0U3VibWl0RGVmYXVsdCApLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICB9LCA1MDApO1xuICAgIH0sIDE1MDApO1xuICB9O1xuXG4gIHRoaXMub25GYWlsdXJlID0gZnVuY3Rpb24oKXtcbiAgICAkaW5wdXRTdWJtaXQudmFsKCBtZXNzYWdlcy5mYWlsdXJlICkucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRpbnB1dFN1Ym1pdC52YWwoIGlucHV0U3VibWl0RGVmYXVsdCApO1xuICAgIH0sIDMwMDApO1xuICB9O1xuXG4gIC8vIEtpY2sgaXQgb2ZmXG4gIGluaXRpYWxpemUoKTtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250YWN0Rm9ybTtcbiIsIkhlYWRlckJsdXJiID0gZnVuY3Rpb24oJGVsKSB7XG5cbiAgdmFyICR0ZXh0RWwgPSAkZWw7XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBmb3Igc3dpdGNoaW5nIHRoZSBoZWFkZXIgdGV4dFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCAtIFRleHQgdG8gc2V0IG9uIHRoZSBlbGVtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiAtIGxlbmd0aCAobXMpIGZvciB0aGUgZW50aXJlIHRleHQgY2hhbmdlIHRyYW5zaXRpb24gdG8gb2NjdXIgKGRlZmF1bHQgaXMgNTAwbXMpXG4gICAqL1xuICB0aGlzLnN3aXRjaFRleHQgPSBmdW5jdGlvbih0ZXh0LCBkdXJhdGlvbikge1xuICAgIHZhciBkID0gZHVyYXRpb24gfHwgMTAwO1xuICAgICAgICBkID0gZCAvIDI7IC8vIHNwbGl0IHRoZSB0b3RhbCBkdXJhdGlvbiBpbiBoYWxmIGZvciB0aGUgdHdvIHBhcnRzIG9mIHRoZSB0cmFuc2l0aW9uXG5cbiAgICAkdGV4dEVsLmZhZGVUbyhkLCAwLCBmdW5jdGlvbigpe1xuICAgICAgdGhpcy50ZXh0KHRleHQpLmZhZGVUbyhkLCAxKTtcbiAgICB9LmJpbmQoJHRleHRFbCkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckJsdXJiO1xuIiwiU2Nyb2xsVXBCdG4gPSBmdW5jdGlvbigkZWwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgJGJ0biA9ICRlbDtcblxuICB2YXIgQVVUT19TQ1JPTExfU1BFRUQgPSA4O1xuICB2YXIgdG91Y2hTY3JvbGwgPSAhMTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZHVyYXRpb24gZm9yIHRoZSBzY3JvbGwgdG8gdG9wIGFuaW1hdGlvbiB0byB0YWtlIHBsYWNlZCBiYXNlZCBvbiBob3cgZmFyIGRvd24gdGhlIHBhZ2UgaXMgc2Nyb2xsZWRcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjcm9sbFRvcCAtIGRpc3RhbmNlIChweCkgc2Nyb2xsZWQgZG93biBmcm9tIHRoZSB0b3BcbiAgICogQHJldHVybiB7TnVtYmVyfSBkdXJhdGlvbiAtIE1pbGxpc2VjXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTY3JvbGxUb3BEdXJhdGlvbihzY3JvbGxUb3ApIHtcbiAgICAvLyBkdXJhdGlvbiA9IHNwZWVkIC8gZGlzdGFuY2U7XG4gICAgcmV0dXJuIHNjcm9sbFRvcCAvIEFVVE9fU0NST0xMX1NQRUVEO1xuICB9XG5cbiAgdGhpcy5hZGRUb3VjaFN1cHBvcnQgPSBmdW5jdGlvbihzY3JvbGwpIHtcbiAgICBpZiggc2Nyb2xsIGluc3RhbmNlb2YgSVNjcm9sbCApIHtcbiAgICAgIC8vIHRvdWNoU2Nyb2xsIGlzIHJlYWwgYnVnZ3kgOi0vXG4gICAgICAvLyB0b3VjaFNjcm9sbCA9IHNjcm9sbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2Nyb2xscyB0byB0b3AsIHJvdGF0ZXMgdGhlIGVsZW1lbnQgYXJvdW5kIHdoaWxlIHRoZSBzY3JvbGwgaGFwcGVuc1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCAtIFRleHQgdG8gc2V0IG9uIHRoZSBlbGVtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvbiAtIGxlbmd0aCAobXMpIGZvciB0aGUgZW50aXJlIHRleHQgY2hhbmdlIHRyYW5zaXRpb24gdG8gb2NjdXIgKGRlZmF1bHQgaXMgNTAwbXMpXG4gICAqL1xuICAgdGhpcy5zY3JvbGxUb1RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICB2YXIgc2Nyb2xsVG9wID0gdG91Y2hTY3JvbGwgPyAtdG91Y2hTY3JvbGwueSA6ICQoJ2JvZHknKS5zY3JvbGxUb3AoKTtcblxuICAgICBpZihzY3JvbGxUb3AgPCAxMDApIHJldHVybjtcblxuICAgICB2YXIgZHVyYXRpb25NcyAgPSBnZXRTY3JvbGxUb3BEdXJhdGlvbiggc2Nyb2xsVG9wICk7XG4gICAgIHZhciBkdXJhdGlvblNlYyA9IChkdXJhdGlvbk1zIC8gMTAwMCk7XG5cbiAgICAgaWYodG91Y2hTY3JvbGwpIHtcbiAgICAgICB0b3VjaFNjcm9sbC5zY3JvbGxUbygwLCAwLCBkdXJhdGlvbk1zKTtcbiAgICAgfVxuICAgICBlbHNlIHtcbiAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICBzY3JvbGxUb3A6IDBcbiAgICAgICAgfSxcbiAgICAgICAgZHVyYXRpb25Nc1xuICAgICAgKTtcbiAgICAgfVxuICAgIFR3ZWVuTWF4LnRvKCRidG4uZ2V0KDApLCBkdXJhdGlvblNlYywge1xuICAgICAgcm90YXRpb246ICctPTM2MCcsXG4gICAgICBlYXNlOiBQb3dlcjIuZWFzZU91dFxuICAgIH0pO1xuICAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgJGJ0bi5jc3Moe1xuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9KVxuICAgIC5hdHRyKCd0aXRsZScsICdTY3JvbGwgVG8gVG9wJylcbiAgICAub24oJ2NsaWNrJywgc2VsZi5zY3JvbGxUb1RvcCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICByZXR1cm4gaW5pdGlhbGl6ZSgpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsVXBCdG47XG4iLCI7KGZ1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICogU2l0ZSBvdmVybGF5IGNvbnRlbnQuXG4gICAqIEhhbmRsZXMgZGlzcGxheSwgYW5kIGNsZWFudXBcbiAgICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbiAgLypcbiAgICogT3ZlcmxheSBDb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtET00gbm9kZX0gZWxlbWVudCAtIFRoZSBvdmVybGF5IGVsZW1lbnQsIGNvbnRhaW5pbmcgYWxsIHRoZSBwcm9wZXIgbWFya3VwIGFuZCBjbGFzc25hbWVzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gICAqL1xuICB2YXIgU3ZPdmVybGF5ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAvLyB0aGlzID0+IFN2T3ZlcmxheVxuICAgIC8vIGVsZW1lbnQgPT4gPGEgaHJlZj1cIiNjb250YWN0XCIgZGF0YS1vdmVybGF5PVwiI2NvbnRhY3QtZm9ybVwiPmNvbnRhY3Q8L2E+XG4gICAgLy8gb3B0aW9ucyA9PiB1bmRlZmluZWRcblxuICAgIHRoaXMub3B0aW9ucyAgICAgICAgPSBvcHRpb25zO1xuICAgIHRoaXMuJGJvZHkgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpO1xuICAgIHRoaXMuJGVsZW1lbnQgICAgICAgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMuaXNTaG93biAgICAgICAgPSAhMTtcblxuICB9O1xuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgb3ZlcmxheSBhbmQgYWRkcyBldmVudCBsaXN0ZW5lcnNcbiAgICpcbiAgICogQHJldHVybiB7c2VsZn1cbiAgICovXG4gIFN2T3ZlcmxheS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgb25Db21wbGV0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcignc2hvd24ub3ZlcmxheScpXG4gICAgfS5iaW5kKHRoaXMpIC8vIHRoaXMgb3ZlcmxheVxuXG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93Lm92ZXJsYXknLCB7IHRhcmdldDogc2VsZi4kZWxlbWVudCB9KTtcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKTtcblxuICAgIGlmICh0aGlzLmlzU2hvd24pIHJldHVybjtcblxuICAgIHRoaXMuaXNTaG93biA9IHRydWU7XG5cbiAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdvdmVybGF5LW9wZW4nKTtcblxuICAgIHRoaXMuZXNjYXBlKCk7XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLm92ZXJsYXknLCAnLm92ZXJsYXktY2xvc2UnLCAkLnByb3h5KHRoaXMuaGlkZSwgdGhpcykpXG5cbiAgICB0aGlzLmVuZm9yY2VGb2N1cygpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5mYWRlVG8oNTAwLCAxLCAnc3dpbmcnLCBvbkNvbXBsZXRlKTsgLy8gJ2Vhc2VPdXRRdWFydCdcblxuICAgIHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgICAvKlxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xuICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoJ292ZXJsYXktb3BlbicpO1xuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrJywgJy5vdmVybGF5LWNsb3NlJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKTtcblxuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5zdi5tb2RhbCcpO1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKTtcbiAgICAqL1xuXG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZGVzIHRoZSBvdmVybGF5IGFuZCByZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgKi9cbiAgU3ZPdmVybGF5LnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oZSl7XG5cbiAgICB2YXIgb25Db21wbGV0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUoKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLm92ZXJsYXknKTtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUub3ZlcmxheScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpO1xuXG4gICAgaWYgKCF0aGlzLmlzU2hvd24pIHJldHVybjtcblxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xuXG4gICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcygnb3ZlcmxheS1vcGVuJyk7XG5cbiAgICB0aGlzLmVzY2FwZSgpO1xuXG4gICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLm92ZXJsYXknKVxuXG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJ2NsaWNrLmRpc21pc3Mub3ZlcmxheScpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5mYWRlVG8oNTAwLCAwLCAnc3dpbmcnLCBvbkNvbXBsZXRlKTsgLy8gZWFzZUluUXVhcnRcblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGZvY3VzIG9uIHRoZSBvdmVybGF5IGFsbG93aW5nIHVzIHRvIGNhcHR1cmUga2V5ZG93biBldmVudHNcbiAgICovXG4gICBTdk92ZXJsYXkucHJvdG90eXBlLmVuZm9yY2VGb2N1cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgJChkb2N1bWVudClcbiAgICAgIC5vZmYoJ2ZvY3VzaW4ub3ZlcmxheScpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgICAgLm9uKCdmb2N1c2luLm92ZXJsYXknLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJiAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKVxuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEF0dGFjaGVzIC8gUmVtb3ZlcyBrZXlkb3duIGhhbmRsZXIgb24gdGhlIG92ZXJsYXkgdGhhdCBjaGVja3MgaWYgdGhlIGVzYyBrZXkgaGFzIGJlZW4gcHJlc3NlZFxuICAgKiAtIEhpZGVzIHRoZSBvdmVybGF5IGlmIGl0IGlzIGRpc3BsYXllZCBhbmQgJ2VzYycgaGFzIGJlZW4gcHJlc3NlZFxuICAgKi9cbiAgU3ZPdmVybGF5LnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3Mub3ZlcmxheScsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKSAvLyBlc2Mga2V5XG4gICAgICB9LCB0aGlzKSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLm92ZXJsYXknKTtcbiAgICB9XG4gIH1cblxuICAvLyBNT0RBTCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihfcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgb3ZlcmxheSA9IG5ldyBTdk92ZXJsYXkodGhpcyk7XG5cbiAgICAgIG92ZXJsYXkuc2hvdygpO1xuXG4gICAgfSk7XG4gIH1cblxuICAkLmZuLnN2T3ZlcmxheSAgICAgICAgICAgICA9IFBsdWdpbjtcbiAgJC5mbi5zdk92ZXJsYXkuQ29uc3RydWN0b3IgPSBTdk92ZXJsYXk7XG5cbiAgLy8gT1ZFUkxBWSBBUEkgKG5vIHByb2dyYW1tYXRpYyB5ZXQsIG9ubHkgY2xpY2tzKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbZGF0YS1vdmVybGF5XScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpO1xuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpO1xuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLW92ZXJsYXknKSB8fCAoaHJlZiAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkpOyAvLyBzdHJpcCBmb3IgaWU3XG5cbiAgICBpZiAoJHRoaXMuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgdGhpcyk7XG5cbiAgfSk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
