require('./Constraint');
lib.BoundingPlaneConstraint = BoundingPlaneConstraint;
function BoundingPlaneConstraint(origin, normal, distance) {
  this._isGlobal = true;
  this.bufferVec3 = lib.Vec3.create(2);
  this.distance = distance || 0;
  this.friction = 0.05;

  this.setOrigin(origin);
  this.setNormal(normal);
}

BoundingPlaneConstraint.create = lib.ctor(BoundingPlaneConstraint);
BoundingPlaneConstraint.prototype = Object.create(lib.Constraint.prototype);
BoundingPlaneConstraint.prototype.constructor = BoundingPlaneConstraint;

BoundingPlaneConstraint.prototype.setOrigin = function (x, y, z) {
  lib.Vec3.set(this.bufferVec3, 0, x, y, z);
};

BoundingPlaneConstraint.prototype.setNormal = function (x, y, z) {
  lib.Vec3.set(this.bufferVec3, 1, x, y, z);
  lib.Vec3.normalize(this.bufferVec3, 1);
};

BoundingPlaneConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var friction = this.friction;
  var b0 = this.bufferVec3;
  var ix = index, iy = ix + 1, iz = ix + 2;

  // OP (O -> P)
  var opX = p0[ix] - b0[0];
  var opY = p0[iy] - b0[1];
  var opZ = p0[iz] - b0[2];

  // N
  var nX = b0[3];
  var nY = b0[4];
  var nZ = b0[5];

  // Project OP onto normal vector N
  var pt = opX * nX + opY * nY + opZ * nZ;
  if (pt > this.distance) { return; }

  p0[ix] -= nX * pt;
  p0[iy] -= nY * pt;
  p0[iz] -= nZ * pt;

  p1[ix] -= (p1[ix] - p0[ix]) * friction;
  p1[iy] -= (p1[iy] - p0[iy]) * friction;
  p1[iz] -= (p1[iz] - p0[iz]) * friction;
};
