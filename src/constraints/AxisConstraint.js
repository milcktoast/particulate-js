require('./Constraint');
lib.AxisConstraint = AxisConstraint;
function AxisConstraint(start, end, a) {
  var size = a.length || 1;

  lib.Constraint.call(this, size, 1);
  this.setAxis(start, end);
  this.setIndices(a);
}

AxisConstraint.create = lib.ctor(AxisConstraint);
AxisConstraint.prototype = Object.create(lib.Constraint.prototype);

AxisConstraint.prototype.setAxis = function (start, end) {
  this.start = start;
  this.end = end;
};

AxisConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ai = this.start;
  var bi = this.indices[index];
  var ci = this.end;

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  // AB (A -> B)
  var abX = p0[bix] - p0[aix];
  var abY = p0[biy] - p0[aiy];
  var abZ = p0[biz] - p0[aiz];

  // AC (A -> C)
  var acX = p0[cix] - p0[aix];
  var acY = p0[ciy] - p0[aiy];
  var acZ = p0[ciz] - p0[aiz];

  var acLenSq = acX * acX + acY * acY + acZ * acZ;
  var acLen = Math.sqrt(acLenSq);

  // Unit vector AC
  var acLenInv = 1 / acLen;
  var acuX = acX * acLenInv;
  var acuY = acY * acLenInv;
  var acuZ = acZ * acLenInv;

  // Project B onto AC as vector AP
  var pt = acuX * abX + acuY * abY + acuZ * abZ;
  var apX = acuX * pt;
  var apY = acuY * pt;
  var apZ = acuZ * pt;

  p0[bix] = p0[aix] + apX;
  p0[biy] = p0[aiy] + apY;
  p0[biz] = p0[aiz] + apZ;
};
