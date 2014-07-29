lib.Constraint = Constraint;
function Constraint(size) {
  this.indices = new Uint16Array(size || 2);
}

Constraint.create = function (size) {
  return new Constraint(size);
};

Constraint.prototype.setIndices = function (indices) {
  var inx = indices.length ? indices : arguments;
  var ii = this.indices;

  for (var i = 0; i < inx.length; i ++) {
    ii[i] = inx[i];
  }
};
