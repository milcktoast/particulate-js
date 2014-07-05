require('./Constraint');
lib.BoxConstraint = BoxConstraint;
function BoxConstraint(opts) {
  this._isGlobal = true;
  this.bounds = new Float32Array(6);
  this.friction = 0.05;
  if (opts.min) { this.setMin.apply(this, opts.min); }
  if (opts.max) { this.setMax.apply(this, opts.max); }
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

BoxConstraint.prototype.applyConstraint = function (ix, p0, p1) {
  var friction = this.friction;
  var b = this.bounds;
  var iy = ix + 1;
  var iz = ix + 2;

  var px = lib.Math.clamp(b[0], b[3], p0[ix]);
  var py = lib.Math.clamp(b[1], b[4], p0[iy]);
  var pz = lib.Math.clamp(b[2], b[5], p0[iz]);

  var dx = p0[ix] - px;
  var dy = p0[iy] - py;
  var dz = p0[iz] - pz;

  p0[ix] = px;
  p0[iy] = py;
  p0[iz] = pz;

  if (dx || dy || dz) {
    p1[ix] -= (p1[ix] - px) * friction;
    p1[iy] -= (p1[iy] - py) * friction;
    p1[iz] -= (p1[iz] - pz) * friction;
  }
};
