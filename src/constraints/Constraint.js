// ..................................................
// Constraint
// ..................................................

lib.Constraint = Constraint;

/**
  Base class for defining constraining relationships between particles.

  @class Constraint
  @constructor
  @param {Int} size           Number of indices to be stored
  @param {Int} itemSize       Number of particles per constraint relation
  @param {Int} [indexOffset]  Number of indices to save at beginning of index array
*/
function Constraint(size, itemSize, indexOffset) {
  indexOffset = indexOffset || 0;

  /**
    Particle indices defining constraint relations

    @property indices
    @type Uint16Array
  */
  this.indices = new Uint16Array(size + indexOffset);

  /**
    Number of constraint relations managed by this instance

    @property _count
    @type Int
    @private
  */
  this._count = size / itemSize;

  /**
    Number of particles per constraint relation

    @property _itemSize
    @type Int
    @private
  */
  this._itemSize = itemSize;

  /**
    Number of indices to save at beginning of index array

    @property _offset
    @type Int
    @private
  */
  this._offset = indexOffset;
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
Constraint.create = lib.ctor(Constraint);

/**
  Set particle indices with `Array` or list of `arguments`.

  @method setIndices
  @param {Int|Array} indices  Single or many particle indices
  @param {Int}       [...a]   Particle index
*/
Constraint.prototype.setIndices = function (indices) {
  var offset = this._offset;
  var inx = indices.length ? indices : arguments;
  var ii = this.indices;

  for (var i = 0; i < inx.length; i ++) {
    ii[i + offset] = inx[i];
  }
};
