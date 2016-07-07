import { inherit } from '../utils/Creator'
import { Force } from './Force'

// ..................................................
// PointForce
// ..................................................

export { PointForce }

/**
  @module forces
*/

/**
  Defines a directional force that affects all particles in the system.

  ```javascript
  var repulsor = PointForce.create([0.0, 2.0, 3.0], {
    type : Force.REPULSOR,
    radius : 15.0,
    intensity : 0.1
  })
  ```

  @class PointForce
  @extends Force
  @constructor
  @param {Array (Vec3)}  position         Force position
  @param {Object}       [opts]            Options
  @param {Int (Enum)}   [opts.type]
  @param {Float}        [opts.radius]
  @param {Float}        [opts.intensity]
*/
function PointForce(position, opts) {
  opts = opts || {}
  Force.apply(this, arguments)

  /**
    Magnitude of force vector

    @property intensity
    @type Float
    @default 0.05
  */
  this.intensity = opts.intensity || 0.05

  this.setRadius(opts.radius || 0)
}

var pf_ATTRACTOR = Force.ATTRACTOR
var pf_REPULSOR = Force.REPULSOR
var pf_ATTRACTOR_REPULSOR = Force.ATTRACTOR_REPULSOR

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(PointForce, Force)

/**
  Set radius

  @method setRadius
  @param {Float} r  Radius
*/
PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r
}

/**
  Cached value of squared influence radius

  @property _radius2
  @type Float
  @private
*/
PointForce.prototype._radius2 = null

PointForce.prototype.applyForce = function (ix, f0, p0, p1) {
  var v0 = this.vector
  var iy = ix + 1
  var iz = ix + 2

  var dx = p0[ix] - v0[0]
  var dy = p0[iy] - v0[1]
  var dz = p0[iz] - v0[2]

  var dist = dx * dx + dy * dy + dz * dz
  var diff = dist - this._radius2
  var isActive, scale

  switch (this.type) {
  case pf_ATTRACTOR:
    isActive = dist > 0 && diff > 0
    break
  case pf_REPULSOR:
    isActive = dist > 0 && diff < 0
    break
  case pf_ATTRACTOR_REPULSOR:
    isActive = dx || dy || dz
    break
  }

  if (isActive) {
    scale = diff / dist * this.intensity

    f0[ix] -= dx * scale
    f0[iy] -= dy * scale
    f0[iz] -= dz * scale
  }
}
