lib.DirectionalForce = DirectionalForce;
function DirectionalForce(x, y, z) {
  this.force = new Float32Array(arguments.length ? [x, y, z] : 3);
}

DirectionalForce.prototype.set = function (x, y, z) {
  var force = this.force;
  force[0] = x;
  force[1] = y;
  force[2] = z;
};

DirectionalForce.prototype.applyForce = function (i, f0) {
  var force = this.force;
  f0[i]     += force[0];
  f0[i + 1] += force[1];
  f0[i + 2] += force[2];
};
