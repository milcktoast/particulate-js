import { inherit } from '../utils/Creator'
import { clamp } from '../math/Math'
import { Vec3 } from '../math/Vec3'
import { Constraint } from './Constraint'

// ..................................................
// BoxConstraint
// ..................................................

export { BoxConstraint }

/**
  @module constraints
*/

/**
  Defines an axis-aligned bounding box which constrains all particles
  in the system to its bounds.

  ```javascript
  var min = [-10.0, -10.0, -10.0]
  var max = [10.0, 10.0, 10.0]
  var box = BoxConstraint.create(min, max)
  ```

  @class BoxConstraint
  @extends Constraint
  @constructor
  @param {Array (Vec3)} min  Bounds minimum
  @param {Array (Vec3)} max  Bounds maximum
*/
function BoxConstraint(min, max) {
  /**
    Damping factor to apply to particles being constrained to bounds

    @property friction
    @type Float
    @default 0.05
  */
  this.friction = 0.05

  /**
    Vec3 buffer which stores bounds

    @property bufferVec3
    @type Float32Array (Vec3)
    @private
  */
  this.bufferVec3 = Vec3.create(2)

  this.setBounds(min, max)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(BoxConstraint, Constraint)

/**
  Global constraint flag

  @property _isGlobal
  @type Bool
  @private
*/
BoxConstraint.prototype._isGlobal = true

/**
  Set bounds

  @method setBounds
  @param {Array (Vec3)} min
  @param {Array (Vec3)} max
*/
BoxConstraint.prototype.setBounds = function (min, max) {
  this.setMin(min)
  this.setMax(max)
}

/**
  Set bounds minimum; alias for `Vec3.set`.

  @method setMin
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
BoxConstraint.prototype.setMin = function (x, y, z) {
  Vec3.set(this.bufferVec3, 0, x, y, z)
}

/**
  Set bounds maximum; alias for `Vec3.set`.

  @method setMin
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
BoxConstraint.prototype.setMax = function (x, y, z) {
  Vec3.set(this.bufferVec3, 1, x, y, z)
}

BoxConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var friction = this.friction
  var b0 = this.bufferVec3
  var ix = index, iy = ix + 1, iz = ix + 2

  var px = clamp(b0[0], b0[3], p0[ix])
  var py = clamp(b0[1], b0[4], p0[iy])
  var pz = clamp(b0[2], b0[5], p0[iz])

  var dx = p0[ix] - px
  var dy = p0[iy] - py
  var dz = p0[iz] - pz

  p0[ix] = px
  p0[iy] = py
  p0[iz] = pz

  if (dx || dy || dz) {
    p1[ix] -= (p1[ix] - px) * friction
    p1[iy] -= (p1[iy] - py) * friction
    p1[iz] -= (p1[iz] - pz) * friction
  }
}
