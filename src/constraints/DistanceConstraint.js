require('./Constraint');
lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  lib.Constraint.call(this, 2);
  this.setDistance(distance);
  this.setIndices(a, b);
}

DistanceConstraint.create = function (distance, a, b) {
  return new DistanceConstraint(distance, a, b);
};

DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

DistanceConstraint.prototype.applyConstraint = function (p0, p1, w0) {
  var ii = this.indices;
  var ai = ii[0], bi = ii[1];
  var ax = ai * 3, ay = ax + 1, az = ax + 2;
  var bx = bi * 3, by = bx + 1, bz = bx + 2;

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  if (!(dx || dy || dz)) {
    dx = dy = dz = 0.1;
  }

  var aw = w0[ai];
  var bw = w0[bi];
  var tw = aw + bw;

  var dist2 = this._distance2;
  var len2 = dx * dx + dy * dy + dz * dz;
  var diff = dist2 / (len2 + dist2);

  var aDiff = diff - aw / tw;
  var bDiff = diff - bw / tw;

  p0[ax] -= dx * aDiff;
  p0[ay] -= dy * aDiff;
  p0[az] -= dz * aDiff;

  p0[bx] += dx * bDiff;
  p0[by] += dy * bDiff;
  p0[bz] += dz * bDiff;
};
