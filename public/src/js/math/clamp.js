var clamp = function(x, min, max) {
  return x < min ? min : x > max ? max : x;
};

module.exports = clamp;