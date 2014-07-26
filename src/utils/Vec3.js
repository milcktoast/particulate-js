lib.Vec3 = {};

lib.Vec3.create = function () {
  return new Float32Array(3);
};

lib.Vec3.set = function (b0, i, x, y, z) {
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

lib.Vec3.get = function (b0, i, out) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  out[0] = b0[ix];
  out[1] = b0[iy];
  out[2] = b0[iz];

  return out;
};
