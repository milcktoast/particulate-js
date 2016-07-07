import { inherit } from '../utils/Creator'
import { Vec3 } from '../math/Vec3'
import { Constraint } from './Constraint'

// ..................................................
// PointConstraint
// ..................................................

export { PointConstraint }

/**
  @module constraints
*/

/**
  Defines one or many relationships between a fixed point and single particles.

  ```javascript
  var point = [0.5, 10.0, 3.0]
  var a = 0, b = 1
  var single = PointConstraint.create(point, a)
  var many = PointConstraint.create(point, [a, b])
  ```

  @class PointConstraint
  @extends Constraint
  @constructor
  @param {Array (Vec3)} position  Point position
  @param {Int|Array}    a         Particle index or list of many indices
*/
function PointConstraint(position, a) {
  var size = a.length || 1

  Constraint.call(this, size, 1)

  /**
    Vec3 buffer which stores point position.

    @property bufferVec3
    @type Float32Array (Vec3)
    @private
  */
  this.bufferVec3 = Vec3.create(1)

  this.setPosition(position)
  this.setIndices(a)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(PointConstraint, Constraint)

/**
  Set point position.

  @method setPosition
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
PointConstraint.prototype.setPosition = function (x, y, z) {
  Vec3.set(this.bufferVec3, 0, x, y, z)
}

PointConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var b0 = this.bufferVec3
  var ai = this.indices[index]
  var ix = ai * 3, iy = ix + 1, iz = ix + 2

  p0[ix] = p1[ix] = b0[0]
  p0[iy] = p1[iy] = b0[1]
  p0[iz] = p1[iz] = b0[2]
}
