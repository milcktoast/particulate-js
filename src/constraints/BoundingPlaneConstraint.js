import { inherit } from '../utils/Creator'
import { Vec3 } from '../math/Vec3'
import { Constraint } from './Constraint'

// ..................................................
// BoundingPlaneConstraint
// ..................................................

export { BoundingPlaneConstraint }

/**
  @module constraints
*/

/**
  Defines an infinite bounding plane which constrains all particles in the system.

  ```javascript
  var origin = [1.0, 2.0, 5.0]
  var normal = [0.0, 1.0, 0.0]
  var bounds = BoundingPlaneConstraint.create(origin, normal)
  var plane = BoundingPlaneConstraint.create(origin, normal, Infinity)
  ```

  @class BoundingPlaneConstraint
  @extends Constraint
  @constructor
  @param {Array (Vec3)}  origin     Plane origin
  @param {Array (Vec3)}  normal     Plane normal / orientation
  @param {Float}        [distance]  Maximum positive distance to affect particles
*/
function BoundingPlaneConstraint(origin, normal, distance) {
  /**
    Positive distance from plane within which particles will be constrained.

    A value of `Infinity` will constrain all particles to be inline with the plane, while
    the default of `0` constrains all particles to space in front of the plane
    relative to its `origin` and orientation `normal`.

    @property distance
    @type Float
    @default 0
  */
  this.distance = distance || 0

  /**
    Damping factor to apply to particles being constrained to bounds

    @property friction
    @type Float
    @default 0.05
  */
  this.friction = 0.05

  /**
    Vec3 buffer which stores plane origin and normal

    @property bufferVec3
    @type Float32Array (Vec3)
    @private
  */
  this.bufferVec3 = Vec3.create(2)

  this.setOrigin(origin)
  this.setNormal(normal)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(BoundingPlaneConstraint, Constraint)

/**
  Global constraint flag

  @property _isGlobal
  @type Bool
  @private
*/
BoundingPlaneConstraint.prototype._isGlobal = true

/**
  Set origin

  @method setOrigin
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
BoundingPlaneConstraint.prototype.setOrigin = function (x, y, z) {
  Vec3.set(this.bufferVec3, 0, x, y, z)
}

/**
  Set normal (automatically normalizes vector)

  @method setNormal
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
BoundingPlaneConstraint.prototype.setNormal = function (x, y, z) {
  Vec3.set(this.bufferVec3, 1, x, y, z)
  Vec3.normalize(this.bufferVec3, 1)
}

BoundingPlaneConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var friction = this.friction
  var b0 = this.bufferVec3
  var ix = index, iy = ix + 1, iz = ix + 2

  // OP (O -> P)
  var opX = p0[ix] - b0[0]
  var opY = p0[iy] - b0[1]
  var opZ = p0[iz] - b0[2]

  // N
  var nX = b0[3]
  var nY = b0[4]
  var nZ = b0[5]

  // Project OP onto normal vector N
  var pt = opX * nX + opY * nY + opZ * nZ
  if (pt > this.distance) { return; }

  p0[ix] -= nX * pt
  p0[iy] -= nY * pt
  p0[iz] -= nZ * pt

  p1[ix] -= (p1[ix] - p0[ix]) * friction
  p1[iy] -= (p1[iy] - p0[iy]) * friction
  p1[iz] -= (p1[iz] - p0[iz]) * friction
}
