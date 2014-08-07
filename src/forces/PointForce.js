require('./Force');
lib.PointForce = PointForce;
function PointForce(position, opts) {
  opts = opts || {};
  lib.Force.apply(this, arguments);
  this.intensity = opts.intensity || 0.05;
  this.setRadius(opts.radius || 0);
}

var pf_ATTRACTOR = lib.Force.ATTRACTOR;
var pf_REPULSOR = lib.Force.REPULSOR;
var pf_ATTRACTOR_REPULSOR = lib.Force.ATTRACTOR_REPULSOR;

PointForce.create = lib.ctor(PointForce);
PointForce.prototype = Object.create(lib.Force.prototype);

PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointForce.prototype.applyForce = function (ix, f0, p0, p1, weight) {
  var v0 = this.vector;
  var iy = ix + 1;
  var iz = ix + 2;

  var dx = p0[ix] - v0[0];
  var dy = p0[iy] - v0[1];
  var dz = p0[iz] - v0[2];

  var dist = dx * dx + dy * dy + dz * dz;
  var diff = dist - this._radius2;
  var isActive, scale;

  switch (this.type) {
  case pf_ATTRACTOR:
    isActive = dist > 0 && diff > 0;
    break;
  case pf_REPULSOR:
    isActive = dist > 0 && diff < 0;
    break;
  case pf_ATTRACTOR_REPULSOR:
    isActive = dx || dy || dz;
    break;
  }

  if (isActive) {
    scale = diff / dist * (this.intensity * weight);

    f0[ix] -= dx * scale;
    f0[iy] -= dy * scale;
    f0[iz] -= dz * scale;
  }
};
