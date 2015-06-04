var lerp = require('./lerp');
var norm = require('./norm');

var map = function(n, r, i, s, o) {
  return lerp(norm(n, r, i), s, o);
}

module.exports = map;