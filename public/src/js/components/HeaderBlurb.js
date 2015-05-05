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
