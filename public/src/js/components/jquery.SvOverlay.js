var $ = require('jquery');

/**
 * Overlay Constructor
 *
 * @constructor
 * @param {DOM node} element - The overlay element, containing all the proper markup and classnames
 * @param {object} options
 */
SvOverlay = function (element, options) {
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

};

/**
 * Hides the overlay and removes event listeners
 *
 * @param {Event} e
 * @return {this}
 */
SvOverlay.prototype.hide = function(e){

  var onComplete = function(){
    console.log(this);
    window.ele = this.$element;
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
