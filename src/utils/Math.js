lib.Math = {};

lib.Math.clamp = function (min, max, v) {
  return Math.min(Math.max(v, min), max);
};
