require('./Force');
lib.PointForce = PointForce;
function PointForce(x, y, z, radius, intensity) {
  lib.Force.apply(this, arguments);
  this.intensity = intensity || 0.05;
  this.setRadius(radius || 0);
}

PointForce.prototype = Object.create(lib.Force.prototype);

PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointForce.prototype.applyForce = function (i, f0, p0) {
  var v0 = this.vec;
  var r2 = this._radius2;
  var ix = i;
  var iy = ix + 1;
  var iz = ix + 2;

  var dx = p0[ix] - v0[0];
  var dy = p0[iy] - v0[1];
  var dz = p0[iz] - v0[2];

  var dist, scale;

  if (dx || dy || dz) {
    dist = dx * dx + dy * dy + dz * dz;
    scale = (dist - this._radius2) / dist * this.intensity;

    f0[ix] -= dx * scale;
    f0[iy] -= dy * scale;
    f0[iz] -= dz * scale;
  }
};
