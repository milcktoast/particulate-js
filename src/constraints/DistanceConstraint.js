require('./Constraint');
lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  var size = a.length || arguments.length - 1;
  var min = distance.length ? distance[0] : distance;
  var max = distance.length ? distance[1] : distance;

  lib.Constraint.call(this, size, 2);
  this.setDistance(min, max);
  this.setIndices(a, b);
}

DistanceConstraint.create = lib.ctor(DistanceConstraint);
DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);
DistanceConstraint.prototype.constructor = DistanceConstraint;

DistanceConstraint.prototype.setDistance = function (min, max) {
  this.setMin(min);
  this.setMax(max != null ? max : min);
};

DistanceConstraint.prototype.setMin = function (min) {
  this._min2 = min * min;
};

DistanceConstraint.prototype.setMax = function (max) {
  this._max2 = max * max;
};

DistanceConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ii = this.indices;
  var ai = ii[index], bi = ii[index + 1];

  var ax = ai * 3, ay = ax + 1, az = ax + 2;
  var bx = bi * 3, by = bx + 1, bz = bx + 2;

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  if (!(dx || dy || dz)) {
    dx = dy = dz = 0.1;
  }

  var dist2 = dx * dx + dy * dy + dz * dz;
  var min2 = this._min2;
  var max2 = this._max2;

  if (dist2 < max2 && dist2 > min2) { return; }

  var target2 = dist2 < min2 ? min2 : max2;
  var diff = target2 / (dist2 + target2);
  var aDiff = diff - 0.5;
  var bDiff = diff - 0.5;

  p0[ax] -= dx * aDiff;
  p0[ay] -= dy * aDiff;
  p0[az] -= dz * aDiff;

  p0[bx] += dx * bDiff;
  p0[by] += dy * bDiff;
  p0[bz] += dz * bDiff;
};
