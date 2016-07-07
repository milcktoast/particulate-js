import { inherit } from '../utils/Creator'
import { clamp } from '../math/Math'
import { Constraint } from './Constraint'

// ..................................................
// AngleConstraint
// ..................................................

export { AngleConstraint }

/**
  @module constraints
*/

/**
  Defines one or many relationships between sets of three particles.

  ```javascript
  var a = 0, b = 1, c = 2
  var single = AngleConstraint.create(Math.PI, a, b, c)
  var many = AngleConstraint.create(Math.PI, [a, b, c, b, c, a])
  ```

  Particles are constrained by a fixed angle or an angle range.
  The angle is defined by segments `ab` and `bc`.

  ```javascript
  var min = Math.PI * 0.25, max = Math.PI * 0.5
  var fixed = AngleConstraint.create(max, 0, 1, 2)
  var range = AngleConstraint.create([min, max], 0, 1, 2)
  ```

  @class AngleConstraint
  @extends Constraint
  @constructor
  @param {Float|Array}  angle  Angle or angle range `[min, max]` between particles
  @param {Int|Array}    a      Particle index or list of many constraint sets
  @param {Int}         [b]     Particle index (only used if `a` is not an array)
  @param {Int}         [c]     Particle index (only used if `a` is not an array)
*/
function AngleConstraint(angle, a, b, c) {
  var size = a.length || arguments.length - 1
  var min = angle.length ? angle[0] : angle
  var max = angle.length ? angle[1] : angle

  Constraint.call(this, size, 3)
  this.setAngle(min, max)
  this.setIndices(a, b, c)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(AngleConstraint, Constraint)

/**
  Set angle

  @method setAngle
  @param {Float}  min
  @param {Float} [max]
*/
AngleConstraint.prototype.setAngle = function (min, max) {
  max = max != null ? max : min
  this.setMin(min)
  this.setMax(max)
}

/**
  Set minimum angle

  @method setMin
  @param {Float} min
*/
AngleConstraint.prototype.setMin = function (min) {
  this._min = this.clampAngle(min)
}

/**
  Minimum angle

  @property _min
  @type Float
  @private
*/
AngleConstraint.prototype._min = null

/**
  Set maximum angle

  @method setMax
  @param {Float} max
*/
AngleConstraint.prototype.setMax = function (max) {
  this._max = this.clampAngle(max)
}

/**
  Maximum angle

  @property _max
  @type Float
  @private
*/
AngleConstraint.prototype._max = null

AngleConstraint.prototype.clampAngle = function (angle) {
  var p = 0.0000001
  return clamp(p, Math.PI - p, angle)
}

/**
  Angle used to classify obtuse angles in constraint solver. For accute angles,
  only particles `a` and `c` are repositioned to satisfy the particle set's
  target angle. For obtuse angles, particle `b` is also repositioned.

  @property ANGLE_OBTUSE
  @type Float
  @default 3/4 Π
  @static
  @final
*/
AngleConstraint.ANGLE_OBTUSE = Math.PI * 0.75

// TODO: Optimize, reduce usage of Math.sqrt
AngleConstraint.prototype.applyConstraint = function (index, p0, p1) {
  /*jshint maxcomplexity:15*/

  var ii = this.indices
  var ai = ii[index], bi = ii[index + 1], ci = ii[index + 2]

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2

  // AB (A -> B)
  var abX = p0[bix] - p0[aix]
  var abY = p0[biy] - p0[aiy]
  var abZ = p0[biz] - p0[aiz]

  // BC (B -> C)
  var bcX = p0[cix] - p0[bix]
  var bcY = p0[ciy] - p0[biy]
  var bcZ = p0[ciz] - p0[biz]

  // AC (A -> C)
  var acX = p0[cix] - p0[aix]
  var acY = p0[ciy] - p0[aiy]
  var acZ = p0[ciz] - p0[aiz]

  // Perturb coincident particles
  if (!(acX || acY || acZ)) {
    p0[aix] += 0.1
    p0[biy] += 0.1
    p0[cix] -= 0.1
    return
  }

  var abLenSq = abX * abX + abY * abY + abZ * abZ
  var bcLenSq = bcX * bcX + bcY * bcY + bcZ * bcZ
  var acLenSq = acX * acX + acY * acY + acZ * acZ

  var abLen = Math.sqrt(abLenSq)
  var bcLen = Math.sqrt(bcLenSq)
  var acLen = Math.sqrt(acLenSq)

  var abLenInv = 1 / abLen
  var bcLenInv = 1 / bcLen

  var minAngle = this._min
  var maxAngle = this._max
  var bAngle = Math.acos(
    -abX * abLenInv * bcX * bcLenInv +
    -abY * abLenInv * bcY * bcLenInv +
    -abZ * abLenInv * bcZ * bcLenInv)

  if (bAngle > minAngle && bAngle < maxAngle) { return; }
  var bAngleTarget = bAngle < minAngle ? minAngle : maxAngle

  // Target length for AC
  var acLenTargetSq = abLenSq + bcLenSq - 2 * abLen * bcLen * Math.cos(bAngleTarget)
  var acLenTarget = Math.sqrt(acLenTargetSq)
  var acDiff = (acLen - acLenTarget) / acLen * 0.5

  p0[aix] += acX * acDiff
  p0[aiy] += acY * acDiff
  p0[aiz] += acZ * acDiff

  p0[cix] -= acX * acDiff
  p0[ciy] -= acY * acDiff
  p0[ciz] -= acZ * acDiff

  // Only manipulate particle B for obtuse targets
  if (bAngleTarget < AngleConstraint.ANGLE_OBTUSE) { return; }

  // Target angle for A
  var aAngleTarget = Math.acos((abLenSq + acLenTargetSq - bcLenSq) / (2 * abLen * acLenTarget))

  // Unit vector AC
  var acLenInv = 1 / acLen
  var acuX = acX * acLenInv
  var acuY = acY * acLenInv
  var acuZ = acZ * acLenInv

  // Project B onto AC as vector AP
  var pt = acuX * abX + acuY * abY + acuZ * abZ
  var apX = acuX * pt
  var apY = acuY * pt
  var apZ = acuZ * pt

  // BP (B -> P)
  var bpX = apX - abX
  var bpY = apY - abY
  var bpZ = apZ - abZ

  // B is inline with AC
  if (!(bpX || bpY || bpZ)) {
    if (bAngleTarget < Math.PI) {
      p0[bix] += 0.1
      p0[biy] += 0.1
      p0[biz] += 0.1
    }
    return
  }

  var apLenSq = apX * apX + apY * apY + apZ * apZ
  var bpLenSq = bpX * bpX + bpY * bpY + bpZ * bpZ
  var apLen = Math.sqrt(apLenSq)
  var bpLen = Math.sqrt(bpLenSq)

  var bpLenTarget = apLen * Math.tan(aAngleTarget)
  var bpDiff = (bpLen - bpLenTarget) / bpLen

  p0[bix] += bpX * bpDiff
  p0[biy] += bpY * bpDiff
  p0[biz] += bpZ * bpDiff
}
