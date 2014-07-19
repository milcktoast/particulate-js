lib.Math = {};
lib.Math.clamp = function (min, max, v) {
  return Math.min(Math.max(v, min), max);
};

lib.Math.distanceTo = function (b0, a, b) {
  var ax = a * 3, ay = ax + 1, az = ax + 2;
  var bx = b * 3, by = bx + 1, bz = bx + 2;
  var dx = b0[ax] - b0[bx];
  var dy = b0[ay] - b0[by];
  var dz = b0[az] - b0[bz];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
