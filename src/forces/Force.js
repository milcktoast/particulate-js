lib.Force = Force;
function Force(x, y, z) {
  this.vec = new Float32Array(3);
  if (arguments.length) { this.set(x, y, z); }
}

Force.prototype.set = function (x, y, z) {
  var vec = this.vec;
  vec[0] = x;
  vec[1] = y;
  vec[2] = z;
};
