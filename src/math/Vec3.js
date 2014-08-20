var Vec3 = lib.Vec3 = {};

Vec3.create = function () {
  return new Float32Array(3);
};

Vec3.set = function (b0, i, x, y, z) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  if (y == null) {
    z = x[2];
    y = x[1];
    x = x[0];
  }

  b0[ix] = x;
  b0[iy] = y;
  b0[iz] = z;
};

Vec3.get = function (b0, i, out) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  out[0] = b0[ix];
  out[1] = b0[iy];
  out[2] = b0[iz];

  return out;
};

Vec3.distance = function (b0, a, b) {
  var ax = a * 3, ay = ax + 1, az = ax + 2;
  var bx = b * 3, by = bx + 1, bz = bx + 2;

  var dx = b0[ax] - b0[bx];
  var dy = b0[ay] - b0[by];
  var dz = b0[az] - b0[bz];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
