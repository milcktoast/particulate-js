import { inherit } from '../utils/Creator'
import { Constraint } from './Constraint'

// ..................................................
// DistanceConstraint
// ..................................................

export { DistanceConstraint }

/**
  @module constraints
*/

/**
  Defines one or many relationships between sets of two particles.

  ```javascript
  var a = 0, b = 1, c = 2
  var single = DistanceConstraint.create(10, a, b)
  var many = DistanceConstraint.create(10, [a, b, a, c])
  ```

  Particles are constrained by a fixed distance or a distance range.

  ```javascript
  var min = 0.5, max = 2.5
  var fixed = DistanceConstraint.create(max, 0, 1)
  var range = DistanceConstraint.create([min, max], 0, 1)
  ```

  @class DistanceConstraint
  @extends Constraint
  @constructor
  @param {Float|Array}  distance  Distance or distance range `[min, max]` between particles
  @param {Int|Array}    a         Particle index or list of many constraint sets
  @param {Int}         [b]        Particle index (only used if `a` is not an array)
*/
function DistanceConstraint(distance, a, b) {
  var size = a.length || arguments.length - 1
  var min = distance.length ? distance[0] : distance
  var max = distance.length ? distance[1] : distance

  Constraint.call(this, size, 2)
  this.setDistance(min, max)
  this.setIndices(a, b)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(DistanceConstraint, Constraint)

/**
  Set distance

  @method setDistance
  @param {Float}  min
  @param {Float} [max]
*/
DistanceConstraint.prototype.setDistance = function (min, max) {
  this.setMin(min)
  this.setMax(max != null ? max : min)
}

/**
  Set minimum distance

  @method setMin
  @param {Float} min
*/
DistanceConstraint.prototype.setMin = function (min) {
  this._min2 = min * min
}

/**
  Cached value of minimum distance squared

  @property _min2
  @type Float
  @private
*/
DistanceConstraint.prototype._min2 = null

/**
  Set maximum distance

  @method setMax
  @param {Float} max
*/
DistanceConstraint.prototype.setMax = function (max) {
  this._max2 = max * max
}

/**
  Cached value of maximum distance squared

  @property _max2
  @type Float
  @private
*/
DistanceConstraint.prototype._max2 = null

DistanceConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ii = this.indices
  var ai = ii[index], bi = ii[index + 1]

  var ax = ai * 3, ay = ax + 1, az = ax + 2
  var bx = bi * 3, by = bx + 1, bz = bx + 2

  var dx = p0[bx] - p0[ax]
  var dy = p0[by] - p0[ay]
  var dz = p0[bz] - p0[az]

  if (!(dx || dy || dz)) {
    dx = dy = dz = 0.1
  }

  var dist2 = dx * dx + dy * dy + dz * dz
  var min2 = this._min2
  var max2 = this._max2

  if (dist2 < max2 && dist2 > min2) { return; }

  var target2 = dist2 < min2 ? min2 : max2
  var diff = target2 / (dist2 + target2)
  var aDiff = diff - 0.5
  var bDiff = diff - 0.5

  p0[ax] -= dx * aDiff
  p0[ay] -= dy * aDiff
  p0[az] -= dz * aDiff

  p0[bx] += dx * bDiff
  p0[by] += dy * bDiff
  p0[bz] += dz * bDiff
}
