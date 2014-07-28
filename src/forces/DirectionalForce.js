require('./Force');
lib.DirectionalForce = DirectionalForce;
function DirectionalForce(vector) {
  lib.Force.apply(this, arguments);
}

DirectionalForce.create = function (vector) {
  return new DirectionalForce(vector);
};

DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1, weight) {
  var v0 = this.vector;
  f0[ix]     += (v0[0] * weight);
  f0[ix + 1] += (v0[1] * weight);
  f0[ix + 2] += (v0[2] * weight);
};
