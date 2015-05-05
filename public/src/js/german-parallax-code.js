var body = $("body"),
    slides = $(".slide"),
    dropCanvas = $(".drops"),
    dropCanvasHolder = $(".stripe.red"),
    blackAndWhite = $(".blackAndWhite"),
    dropController, scrollScene, container = $(".container"),
    scrollContainer = $(Modernizr.touch ? ".scroll-container" : window),
    navigationArrow = $(".navigation .arrow"),
    nextSlideButtons = $(".next.button"),
    activeLightboxId, controller, navigationDrops = {},
    dropMorphSpeed = 500,
    scenes = {},
    myScroll, 
    navigationArrowTween, 
    client, 
    bannerMode = $("html").hasClass("banner"),
    isSafari = -1 != navigator.userAgent.indexOf("Safari") && -1 == navigator.userAgent.indexOf("Chrome");

function slideInDrops() {
    if (dropController) {
        var e = dropController.xIndex * dropController.dropWidth + 100,
            t = dropCanvasHolder.innerWidth() - dropCanvasHolder.width();
        TweenMax.from(dropCanvasHolder, 3, {
            x: -e - t,
            onStart: function() {
                dropCanvasHolder.addClass("canvasReady"), dropController.hidden = !1, dropController.render()
            },
            ease: Power2.easeOut
        })
    }
}

function autoDrop() {
    dropController.addDrop(), setTimeout(autoDrop, 3e3 * Math.random())
}

function resize() {
    if (!body.hasClass("keyboard-visible")) {
        dropController && dropController.resize(), adjustSlideDimensions(), fitLine();
        for (var e in scenes) {
            var t = getScrollHeight(scenes[e].triggerElement());
            scenes[e].duration(t)
        }
    }
}

function adjustSlideDimensions() {
    slides.height($(window).innerHeight())
}

function fitLine() {
    $("#Home .content").addClass("fitting"), textFit($(".supports.line").get(0), {
        widthOnly: !0
    }), $(".adjustText").css("font-size", $(".supports.line").find(".second").css("font-size")), $("#Home .content").removeClass("fitting")
}

function getScrollHeight(e) {
    var t = e.find(".step").size() + 1;
    return $(window).innerHeight() * t
}

function initScrollControls() {
    controller = new ScrollMagic({
        container: scrollContainer,
        globalSceneOptions: {
            triggerHook: "onLeave",
            offset: 1
        }
    }), 

    scenes.Home = new ScrollScene({
        triggerElement: slides.first(),
        duration: 0
    })
    .setPin(slides.first())
    .on("enter leave", navigateScene)
    .on("end", function() {
        slides.first().addClass("stayWhereYouAre")
    })
    .on("start", function() {
        slides.removeClass("stayWhereYouAre")
    })
    .addTo(controller), 

    slides.not(slides.first()).not(".hidden").not("#Formular").each(function(e, t) {
        var n = addSlideAnimations(e, t);
        scenes[t.id] = n
    }), 

    scenes.Formular = new ScrollScene({
        triggerElement: $("#Formular"),
        duration: 0
    }).on("enter leave", navigateScene).addTo(controller)
}

// Called for each slide
// @param e - index
// @param t - element w/ slide
function addSlideAnimations(e, t) {
    var n = .7,
        o = $(t),
        i = new TimelineMax,
        r = new ScrollScene({
            triggerElement: o,
            duration: getScrollHeight(o)
        });

    return addStepAnimations(o, i), 
    i.add(TweenMax.from(o.find("defs").first(), n, {})), 
    r.setTween(i).setPin(o).on("enter leave", navigateScene).on("end", function() {
        o.addClass("stayWhereYouAre")
    })
    .on("start", function() {
        slides.removeClass("stayWhereYouAre")
    }).addTo(controller), 
    r
}

function debugEvents(e) {
    e.on("progress start end enter leave", function(e) {
        console.log(e.target.triggerElement().attr("id"), e.type, e.scrollDirection)
    })
}

function navigateScene(e) {
    var t = e.target.getPin() || $("#Formular");
    switch (e.type) {
        case "leave":
            if ("FORWARD" === e.scrollDirection) {
                var n = t.parent().next().find(".slide");
                updateMenuColor(n.attr("id")), onNavigateTo(n.attr("id"))
            } else unmarkPreviouse(t);
            break;
        case "enter":
            "REVERSE" === e.scrollDirection ? (updateMenuColor(t.attr("id")), onNavigateTo(t.attr("id"))) : markPreviouse(t)
    }
}

function markPreviouse(e) {
    e.parent().prev().find(".slide").addClass("visited")
}

function unmarkPreviouse(e) {
    e.parent().prev().find(".slide").removeClass("visited")
}

// @param e - $(el.slide)
// @param t - TimelineMax instance, for each slide section
function addStepAnimations(e, t) {                                  // r = num steps
    for (var n, o = buntsteps[e.attr("id")], i = e.find(".step"), r = Math.max(Object.size(o), i.size()), a = 0; r > a; a++) {
        var s = [], // container for a bunch of timelines
            l = i.eq(a), // step at index a
            d = "step-" + a;
        if (0 === a && e.find(".svg-container").size() && s.push(TweenMax.from(e.find("svg"), 1, {
                css: {
                    transform: "scale(0.5)",
                    autoAlpha: 0
                },
                ease: Circ.easeInOut
            })), l) 
            {
                // if it's the first step, create a new timelinemax instance
                // start an array of tweens (u)
                var c = new TimelineMax,
                    u = [TweenMax.from(l.find(".text"), 1, {
                        css: {
                            transform: "translateY(30px)",
                            autoAlpha: 0
                        }
                    })];
            //
            n && (u.push(
                    TweenMax.to(n.find(".text"), .5, {
                        autoAlpha: 0
                    })), c.delay(1)), 
            

            addAnimations(o, d, e, u), 
            // Add the array of tweens to the timeline max instance
            c.add(u), 
            // add the timeline max instance to the array of timelines
            s.push(c)
        }
        else {
            addAnimations(o, d, e, s);
        }
        n = l, 
        // add the timelinemax to the timeline max for the slide section that we passed in originally
        t.add(s)
    }
}

// @param e - menu item element
// @param t - "step-*" string
// @param n - $(el.slide)
// @param o - array of tweens (u) for timelinemax instance owned by the slide
function addAnimations(e, t, n, o) {
    if (e && e[t])
        for (var i in e[t]) {
            var r = e[t][i].direction || "from",
                a = e[t][i].duration || 1;
            (e[t][i].forceRedraw || e[t][i].forceRedrawSafari) && ((isSafari || e[t][i].forceRedraw) && (e[t][i].onUpdate = function(e) {
                var t = e.find("svg").get(0);
                t.style.display = "none", t.offsetHeight, t.style.display = "block"
            }, e[t][i].onUpdateParams = [n]), delete e[t][i].forceRedraw, e[t][i].forceRedrawSafari && delete e[t][i].forceRedrawSafari), o.push(TweenMax[r](n.find(i), a, e[t][i]))
        }
}

function addTouchSupport() {
    0 != window.scrollY && window.scrollTo(0, 0), 
    myScroll = new IScroll(".scroll-container", {
        scrollX: !1,
        scrollY: !0,
        scrollbars: !0,
        useTransform: !1,
        useTransition: !1,
        probeType: 3,
        tap: !0
    }), 
    controller.scrollPos(function() {
        return -myScroll.y
    }), 
    myScroll.on("scroll", function() {
        controller.update()
    }), 
    document.addEventListener("touchmove", function(e) {
        e.preventDefault()
    }, !1), 
    body.on({
        "lightbox-open": function() {
            myScroll.disable(), $(activeLightboxId + " .content").on("touchstart touchmove", function(e) {
                e.stopPropagation()
            })
        },
        "lightbox-close": function() {
            $(activeLightboxId + " .content").off("touchstart"), myScroll.enable()
        }
    })
}

function updateMenuColor(e) {
    e && (buntsteps[e] && buntsteps[e]["dark-menu"] ? blackAndWhite.addClass("dark") : blackAndWhite.removeClass("dark"))
}

function animateDrop(e, t, n) {
    e && e.animate({
        d: e.attr("data-" + t)
    }, dropMorphSpeed, n)
}

function scrollToSlide(e) {
    var t = scenes[e.attr("id")].triggerOffset();
    switch (e.attr("id")) {
        case "Formular":
            setTimeout(onNavigateTo, 1e3, "Formular");
            break;
        case "Home":
            t = 0;
            break;
        default:
            t += $(window).innerHeight()
    }
    $(scrollContainer).scrollTop() !== t && scrollToOffset(t)
}

function scrollToOffset(e) {
    myScroll ? myScroll.scrollTo(0, -e, 1e3) : isSafari ? scrollContainer.scrollTop(e) : TweenMax.to(scrollContainer, 1, {
        scrollTo: {
            y: e
        }
    })
}

function init() {
    return adjustSlideDimensions(), fitLine(), bannerMode ? void $(window).on({
        resize: resize,
        load: loadSignatures
    }) : (initScrollControls(), initLightbox(), initNavigation(), initForm(), void $(window).on({
        resize: resize,
        load: loaded
    }))
}

function loaded() {
    Modernizr.touch && (FastClick.attach(document.body), setTimeout(addTouchSupport, 200)), Modernizr.pointerevents || slides.on("mousewheel DOMMouseScroll", function(e) {
        scrollContainer.scrollTop(scrollContainer.scrollTop() - (e.originalEvent.wheelDelta || 10 * -e.originalEvent.detail))
    }), loadSignatures()
}

Object.size = function(e) {
    var t, n = 0;
    for (t in e) e.hasOwnProperty(t) && n++;
    return n
}, $(document).ready(init);