require('./Force');
lib.DirectionalForce = DirectionalForce;
function DirectionalForce(vector) {
  lib.Force.call(this, vector);
}

DirectionalForce.create = lib.ctor(DirectionalForce);
DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1) {
  var v0 = this.vector;
  f0[ix]     += v0[0];
  f0[ix + 1] += v0[1];
  f0[ix + 2] += v0[2];
};
