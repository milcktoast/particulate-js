lib.Force = Force;
function Force(vector, opts) {
  opts = opts || {};
  this.vector = new Float32Array(3);
  this.type = opts.type || Force.ATTRACTOR;

  if (vector != null) { this.set(vector); }
}

Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;

Force.create = function (vector, opts) {
  return new Force(vector, opts);
};

Force.prototype.set = function (x, y, z) {
  lib.Vec3.set(this.vector, 0, x, y, z);
};
