require('./Constraint');
lib.PlaneConstraint = PlaneConstraint;
function PlaneConstraint(planeA, planeB, planeC, a) {
  var size = a.length || 1;

  lib.Constraint.call(this, size, 1, 3);
  this.bufferVec3 = lib.Vec3.create(1);
  this.setPlane(planeA, planeB, planeC);
  this.setIndices(a);
}

PlaneConstraint.create = lib.ctor(PlaneConstraint);
PlaneConstraint.prototype = Object.create(lib.Constraint.prototype);
PlaneConstraint.prototype.constructor = PlaneConstraint;

PlaneConstraint.prototype.setPlane = function (a, b, c) {
  var ii = this.indices;

  ii[0] = a;
  ii[1] = b;
  ii[2] = c;
};

// TODO: Cache calculated plane normal
PlaneConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ii = this.indices;
  var ai = ii[0], bi = ii[1], ci = ii[2], pi = ii[index + 3];

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;
  var pix = pi * 3, piy = pix + 1, piz = pix + 2;

  // AB (B -> A)
  var abX = p0[aix] - p0[bix];
  var abY = p0[aiy] - p0[biy];
  var abZ = p0[aiz] - p0[biz];

  // BC (B -> C)
  var bcX = p0[cix] - p0[bix];
  var bcY = p0[ciy] - p0[biy];
  var bcZ = p0[ciz] - p0[biz];

  // N
  var nX = abY * bcZ - abZ * bcY;
  var nY = abZ * bcX - abX * bcZ;
  var nZ = abX * bcY - abY * bcX;
  var nLenSq = nX * nX + nY * nY + nZ * nZ;

  if (!nLenSq) {
    p0[bix] += 0.1;
    p0[biy] += 0.1;
    p0[biz] += 0.1;
    return;
  }

  // Unit vector N
  var nLenInv = 1 / Math.sqrt(nLenSq);
  var nuX = nX * nLenInv;
  var nuY = nY * nLenInv;
  var nuZ = nZ * nLenInv;

  // BP (B -> P)
  var opX = p0[pix] - p0[bix];
  var opY = p0[piy] - p0[biy];
  var opZ = p0[piz] - p0[biz];

  // Project OP onto normal vector N
  var pt = opX * nuX + opY * nuY + opZ * nuZ;

  p0[pix] -= nuX * pt;
  p0[piy] -= nuY * pt;
  p0[piz] -= nuZ * pt;
};
