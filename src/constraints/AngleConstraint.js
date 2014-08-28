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
  this.setMin(min);
  this.setMax(max);
};

AngleConstraint.prototype.setMin = function (min) {
  this._min = this.clampAngle(min);
};

AngleConstraint.prototype.setMax = function (max) {
  this._max = this.clampAngle(max);
};

AngleConstraint.prototype.clampAngle = function (angle) {
  var p = 0.0000001;
  return lib.Math.clamp(p, Math.PI - p, angle);
};

// TODO:
// Add support for angle range
// Handle cases of coincident particles
// Optimize, reduce usage of Math.sqrt
function angleConstraint_apply(p0, w0, min, max, ai, bi, ci) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  var bAngleTarget = min;

  // AB (A -> B)
  var abX = p0[bix] - p0[aix];
  var abY = p0[biy] - p0[aiy];
  var abZ = p0[biz] - p0[aiz];

  // BC (B -> C)
  var bcX = p0[cix] - p0[bix];
  var bcY = p0[ciy] - p0[biy];
  var bcZ = p0[ciz] - p0[biz];

  // AC (A -> C)
  var acX = p0[cix] - p0[aix];
  var acY = p0[ciy] - p0[aiy];
  var acZ = p0[ciz] - p0[aiz];

  var abLenSq = abX * abX + abY * abY + abZ * abZ;
  var bcLenSq = bcX * bcX + bcY * bcY + bcZ * bcZ;
  var acLenSq = acX * acX + acY * acY + acZ * acZ;

  var abLen = Math.sqrt(abLenSq);
  var bcLen = Math.sqrt(bcLenSq);
  var acLen = Math.sqrt(acLenSq);

  // Unit vector AC
  var acLenInv = 1 / acLen;
  var acuX = acX * acLenInv;
  var acuY = acY * acLenInv;
  var acuZ = acZ * acLenInv;

  // Target length for AC
  var acLenTargetSq = abLenSq + bcLenSq - 2 * abLen * bcLen * Math.cos(bAngleTarget);
  var acLenTarget = Math.sqrt(acLenTargetSq);

  // Target angle for A
  var aAngleTarget = Math.acos((abLenSq + acLenTargetSq - bcLenSq) / (2 * abLen * acLenTarget));

  // Project B onto AC as vector AP
  var pt = acuX * abX + acuY * abY + acuZ * abZ;
  var apX = acuX * pt;
  var apY = acuY * pt;
  var apZ = acuZ * pt;

  // BP (B -> P)
  var bpX = apX - abX;
  var bpY = apY - abY;
  var bpZ = apZ - abZ;

  var apLenSq = apX * apX + apY * apY + apZ * apZ;
  var apLen = Math.sqrt(apLenSq);
  var bpLen = Math.sqrt(abLenSq - apLenSq);
  var bpLenTarget = apLen * Math.tan(aAngleTarget);

  var bpDiff = (bpLen - bpLenTarget) / bpLen;
  var acDiff = (acLen - acLenTarget) / acLen * 0.5;

  p0[aix] += acX * acDiff;
  p0[aiy] += acY * acDiff;
  p0[aiz] += acZ * acDiff;

  p0[bix] += bpX * bpDiff;
  p0[biy] += bpY * bpDiff;
  p0[biz] += bpZ * bpDiff;

  p0[cix] -= acX * acDiff;
  p0[ciy] -= acY * acDiff;
  p0[ciz] -= acZ * acDiff;
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
