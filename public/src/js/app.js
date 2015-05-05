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
