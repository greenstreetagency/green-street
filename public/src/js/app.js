// Include dependencies
var $           = require('jquery');
var ScrollMagic = require('scrollmagic');
                  require('scrollmagic-gsap');
var IScroll     = require('iscroll-probe');
var TweenMax    = require('tween-max');

                  require('./components/jquery.SvOverlay.js'); // $.fn.overlay

// Components
var HeaderBlurb = require('./components/HeaderBlurb.js');
var ContactForm = require('./components/ContactForm.js');
var ScrollUpBtn = require('./components/ScrollUpBtn.js');


// App Code
(function(Modernizr, undefined){

  var touchEnabled = Modernizr.touch;

  var $win  = $(window);
  var $body = $(document.body);
  var $header = $('.header');
  var $slides = $('.slide');
  var $scrollContainer = $(touchEnabled ? "#scroll-container" : window);
  var scrollController;
  var scenes = {};
  var touchScroll; // IScroll instance

  var headerBlurb = new HeaderBlurb( $('#blurb-text')  );
  var contactForm = new ContactForm( $('form#contact') );
  var scrollUpBtn = new ScrollUpBtn( $('.blurb img')   );

  function initialize() {
    initScrollControls();
    onResize();
    $win.on({
      load              : onLoaded,
      resize            : onResize,
      orientationchange : onOrientationChange
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
      scene.offset(   getOffsetForScene(e)   );
    }
  }

  function onOrientationChange() {
    scrollController.update();
  }

  function addTouchSupport() {

    0 != window.scrollY && window.scrollTo(0, 0);

    touchScroll = new IScroll("#scroll-container", {
      scrollX       : false,
      scrollY       : true,
      scrollbars    : true,
      useTransform  : false,
      useTransition : false,
      probeType     : 3,
      tap           : !0,
      click         : !0
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
          webkitFilter : "blur(" + blurAmount.a + "px)",
          filter       : "blur(" + blurAmount.a + "px)"
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
          y: '-60%'
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
          })
      );

      scene.setTween(tL);

    },
    process : function( scene ) {
      var tL = new TimelineMax();

      var $processStepsInline  = $('.process-step-inline');
      var $processStepsAbs     = $('.process-step-absolute');
      var $processDescriptions = $('.process-step-description');
      var processStepCount     = $processStepsInline.size();

      $processStepsInline.css(  {'opacity' : 0.1} );
      $processStepsAbs.css(     {'opacity' : 0}   );
      $processDescriptions.css( {'opacity' : 0}   )

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

  /**
   * Returns a duration in pixels as the length that the scene will scroll for
   *
   * @param {String} key - Key identifier for the scene ("home", "branding", etc..)
   * @param {ScrollMagic.Scene} scene - Scene to add the animations to
   * @param {Object} opts - Options object, some scene animation functions have required options (bgColor, a jQuery wrapped dom node..)
   */
  function addSceneAnimationForType(key, scene, opts) {
    if(sceneAnimations.hasOwnProperty(key))
      sceneAnimations[key].call( this, scene, opts );
  }

  /**
   * Adds animations to each of the scenes
   */
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

  /**
   * Initializes the ScrollMagic controller, Scrollmagic scenes, adds them to the controller and then adds animations to each of the scenes
   */
  function initScrollControls() {

    var headerHeight = getHeaderHeight();

    scrollController = new ScrollMagic.Controller({
      container: $scrollContainer.get(0),
      globalSceneOptions: {
        offset      : -headerHeight,
        duration    : (window.innerHeight - headerHeight) * 3,
        triggerHook : "onLeave",
        offset      : 1 //-headerHeight
      }
    });

    scenes.home = new ScrollMagic.Scene({
      triggerElement: '#home'
    })
    .setPin("#home");

    scenes.branding = new ScrollMagic.Scene({
      triggerElement: '#branding'
    })
    .setPin("#branding")
    .on("enter", function(e){
      // headerBlurb.setText('What We Do');
    })
    .on("leave", function(e){
      // if(e.scrollDirection == "REVERSE")
      //   headerBlurb.setText('Creative Cannabis Agency');
    });

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
    .setPin("#process")
    .on("enter", function(e){
      // console.log('enter process section');
      // console.log(e);
      // headerBlurb.setText('Our Process');
    })
    .on("leave", function(e){
      // if(e.scrollDirection == "REVERSE")
      //   headerBlurb.setText('What We Do');
    });

    scenes.clients = new ScrollMagic.Scene({
      triggerElement: '#clients'
    })
    .on("enter", function(e){
      // headerBlurb.setText('Clients');
    })
    .on("leave", function(e){
      // console.log('leave clients');
      // console.log(e);
      // if(e.scrollDirection == "REVERSE")
      //   headerBlurb.setText('Our Process');
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

})(Modernizr);
