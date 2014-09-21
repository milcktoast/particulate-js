lib.Constraint = Constraint;
function Constraint(size, itemSize, indexOffset) {
  indexOffset = indexOffset || 0;
  this.indices = new Uint16Array(size + indexOffset);
  this._count = size / itemSize;
  this._itemSize = itemSize;
  this._offset = indexOffset;
}

Constraint.create = lib.ctor(Constraint);

Constraint.prototype.setIndices = function (indices) {
  var offset = this._offset;
  var inx = indices.length ? indices : arguments;
  var ii = this.indices;

  for (var i = 0; i < inx.length; i ++) {
    ii[i + offset] = inx[i];
  }
};
