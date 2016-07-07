import { inherit } from '../utils/Creator'

// ..................................................
// Constraint
// ..................................................

export { Constraint }

/**
  Constraints define relationships between multiple particles or
  between particles and geometric primitives.

  @module constraints
  @main constraints
*/

/**
  Base class for defining particle constraints.

  @class Constraint
  @constructor
  @param {Int} size           Number of indices to be stored
  @param {Int} itemSize       Number of particles per constraint relation
  @param {Int} [indexOffset]  Number of indices to save at beginning of index array
*/
function Constraint(size, itemSize, indexOffset) {
  indexOffset = indexOffset || 0

  /**
    Particle indices defining constraint relations

    @property indices
    @type Uint16Array
  */
  this.indices = new Uint16Array(size + indexOffset)

  /**
    Number of constraint relations managed by this instance

    @property _count
    @type Int
    @private
  */
  this._count = size / itemSize

  /**
    Number of particles per constraint relation

    @property _itemSize
    @type Int
    @private
  */
  this._itemSize = itemSize

  /**
    Number of indices to save at beginning of index array

    @property _offset
    @type Int
    @private
  */
  this._offset = indexOffset
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(Constraint, Object)

/**
  Set particle indices with `Array` or list of `arguments`.

  @method setIndices
  @param {Int|Array} indices  Single or many particle indices
  @param {Int}       [...a]   Particle index
*/
Constraint.prototype.setIndices = function (indices) {
  var offset = this._offset
  var inx = indices.length ? indices : arguments
  var ii = this.indices

  for (var i = 0; i < inx.length; i ++) {
    ii[i + offset] = inx[i]
  }
}

/**
  Apply constraint to one set of particles defining a constrint relation.
  Called `_count` times per relaxation loop.

  @method applyConstraint
  @param {Int}                 index  Constraint set index
  @param {Float32Array (Vec3)} p0     Reference to `ParticleSystem.positions`
  @param {Float32Array (Vec3)} p1     Reference to `ParticleSystem.positionsPrev`
  @protected
*/
Constraint.prototype.applyConstraint = function (index, p0, p1) {}
