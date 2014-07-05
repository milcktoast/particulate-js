require('./Constraint');
lib.BoxConstraint = BoxConstraint;
function BoxConstraint(x0, y0, z0, x1, y1, z1) {
  this._isGlobal = true;
  this.bounds = new Float32Array(arguments.length ? [x0, y0, z0, x1, y1, z1] : 6);
}

BoxConstraint.prototype = Object.create(lib.Constraint.prototype);

BoxConstraint.prototype.setMin = function (x, y, z) {
  var b = this.bounds;

  b[0] = x;
  b[1] = y;
  b[2] = z;
};

BoxConstraint.prototype.setMax = function (x, y, z) {
  var b = this.bounds;

  b[3] = x;
  b[4] = y;
  b[5] = z;
};

BoxConstraint.prototype.applyConstraint = function (ix, positions) {
  var b = this.bounds;
  var iy = ix + 1;
  var iz = ix + 2;

  positions[ix] = lib.Math.clamp(b[0], b[3], positions[ix]);
  positions[iy] = lib.Math.clamp(b[1], b[4], positions[iy]);
  positions[iz] = lib.Math.clamp(b[2], b[5], positions[iz]);
};
