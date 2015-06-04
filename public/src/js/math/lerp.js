var lerp = function(x1, x2, amt) {
  return x2 + (amt - x2) * x1;
}

module.exports = lerp;