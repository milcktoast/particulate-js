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

Vec3.distance = function (b0, ai, bi) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;

  var dx = b0[aix] - b0[bix];
  var dy = b0[aiy] - b0[biy];
  var dz = b0[aiz] - b0[biz];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

Vec3.angle = function (b0, ai, bi, ci) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  var abLen = 1 / Vec3.distance(b0, ai, bi);
  var bcLen = 1 / Vec3.distance(b0, bi, ci);

  var abX = (b0[bix] - b0[aix]) * abLen;
  var abY = (b0[biy] - b0[aiy]) * abLen;
  var abZ = (b0[biz] - b0[aiz]) * abLen;

  var bcX = (b0[cix] - b0[bix]) * bcLen;
  var bcY = (b0[ciy] - b0[biy]) * bcLen;
  var bcZ = (b0[ciz] - b0[biz]) * bcLen;

  var dot = abX * bcX + abY * bcY + abZ * bcZ;

  return Math.acos(dot);
};
