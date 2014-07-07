lib.Constraint = Constraint;
function Constraint() {}

Constraint.setIndices = function (itemSize) {
  return function () {
    var indices = this._indices;
    for (var i = 0; i < arguments.length; i ++) {
      for (var j = 0; j < itemSize; j ++) {
        indices[i * itemSize + j] = arguments[i] * itemSize + j;
      }
    }
  };
};
