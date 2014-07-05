lib.Force = Force;
function Force(x, y, z, opts) {
  opts = opts || {};
  this.vec = new Float32Array(3);
  this.type = opts.type || Force.ATTRACTOR;
  if (arguments.length) { this.set(x, y, z); }
}

Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;

Force.prototype.set = function (x, y, z) {
  var vec = this.vec;
  vec[0] = x;
  vec[1] = y;
  vec[2] = z;
};
