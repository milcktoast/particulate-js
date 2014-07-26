lib.Force = Force;
function Force(x, y, z, opts) {
  opts = opts || {};
  this.vector = new Float32Array(3);
  this.type = opts.type || Force.ATTRACTOR;

  if (arguments.length) { this.set(x, y, z); }
}

Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;

Force.prototype.set = function (x, y, z) {
  lib.Vec3.set(this.vector, 0, x, y, z);
};
