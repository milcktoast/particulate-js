require('./Force');
lib.DirectionalForce = DirectionalForce;
function DirectionalForce(x, y, z) {
  lib.Force.apply(this, arguments);
}

DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (i, f0) {
  var v0 = this.vec;
  f0[i]     += v0[0];
  f0[i + 1] += v0[1];
  f0[i + 2] += v0[2];
};
