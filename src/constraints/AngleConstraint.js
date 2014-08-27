require('./Constraint');
lib.AngleConstraint = AngleConstraint;
function AngleConstraint(angle, a, b, c) {
  var size = a.length || arguments.length - 1;
  var min = angle.length ? angle[0] : angle;
  var max = angle.length ? angle[1] : angle;

  lib.Constraint.call(this, size);
  this.setAngle(min, max);
  this.setIndices(a, b, c);
  this._count = size / 3;
}

AngleConstraint.create = lib.ctor(AngleConstraint);
AngleConstraint.prototype = Object.create(lib.Constraint.prototype);

AngleConstraint.prototype.setAngle = function (min, max) {
  max = max != null ? max : min;
  this._min = min;
  this._max = max;
};

AngleConstraint.prototype.setMin = function (min) {
  this._min = min;
};

AngleConstraint.prototype.setMax = function (max) {
  this._max = max;
};

function angleConstraint_apply(p0, w0, min, max, ai, bi, ci) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  var bAngleTarget = min;
  var cAngle = lib.Vec3.angle(p0, bi, ci, ai);

  var abLen = lib.Vec3.distance(p0, ai, bi);
  var acLen = lib.Vec3.distance(p0, ai, ci);

  var acLenTarget = abLen / Math.sin(cAngle) * Math.sin(bAngleTarget);
  var acDiff = (acLen - acLenTarget) / acLen * 0.5;

  var dx = p0[cix] - p0[aix];
  var dy = p0[ciy] - p0[aiy];
  var dz = p0[ciz] - p0[aiz];

  p0[aix] += dx * acDiff;
  p0[aiy] += dy * acDiff;
  p0[aiz] += dz * acDiff;

  p0[cix] -= dx * acDiff;
  p0[ciy] -= dy * acDiff;
  p0[ciz] -= dz * acDiff;
}

AngleConstraint.prototype.applyConstraint = function (p0, p1, w0) {
  var min = this._min;
  var max = this._max;
  var count = this._count;
  var ii = this.indices;

  if (count === 1) {
    angleConstraint_apply(p0, w0, min, max, ii[0], ii[1], ii[2]);
    return;
  }

  var i, ai, bi, ci;
  for (i = 0; i < count; i ++) {
    ai = i * 3;
    bi = ai + 1;
    ci = ai + 2;
    angleConstraint_apply(p0, w0, min, max, ii[ai], ii[bi], ii[ci]);
  }
};
