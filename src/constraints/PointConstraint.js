lib.PointConstraint = PointConstraint;
function PointConstraint(position, a) {
  var size = a.length || 1;

  lib.Constraint.call(this, size, 1);
  this.bufferVec3 = lib.Vec3.create(1);
  this.setPosition(position);
  this.setIndices(a);
}

PointConstraint.create = lib.ctor(PointConstraint);
PointConstraint.prototype = Object.create(lib.Constraint.prototype);

PointConstraint.prototype.setPosition = function (x, y, z) {
  lib.Vec3.set(this.bufferVec3, 0, x, y, z);
};

PointConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var b0 = this.bufferVec3;
  var ai = this.indices[index];
  var ix = ai * 3, iy = ix + 1, iz = ix + 2;

  p0[ix] = p1[ix] = b0[0];
  p0[iy] = p1[iy] = b0[1];
  p0[iz] = p1[iz] = b0[2];
};
