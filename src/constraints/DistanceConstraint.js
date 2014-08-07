require('./Constraint');
lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  var size = a.length || arguments.length - 1;
  lib.Constraint.call(this, size);
  this.setDistance(distance);
  this.setIndices(a, b);
  this._count = size * 0.5;
}

DistanceConstraint.create = lib.ctor(DistanceConstraint);
DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

function dc_applyConstraint(p0, p1, w0, dist2, ai, bi) {
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
}

DistanceConstraint.prototype.applyConstraint = function (p0, p1, w0) {
  var dist2 = this._distance2;
  var count = this._count;
  var ii = this.indices;

  if (count === 1) {
    dc_applyConstraint(p0, p1, w0, dist2, ii[0], ii[1]);
    return;
  }

  var i, ai, bi;
  for (i = 0; i < count; i ++) {
    ai = i * 2;
    bi = ai + 1;
    dc_applyConstraint(p0, p1, w0, dist2, ii[ai], ii[bi]);
  }
};
