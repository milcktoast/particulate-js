import { inherit } from '../utils/Creator'
import { Constraint } from './Constraint'

// ..................................................
// AxisConstraint
// ..................................................

export { AxisConstraint }

/**
  @module constraints
*/

/**
  Defines one or many relationships between an infinite axis and single particles.

  Orientaiton of the axis is defined by 2 points: `axisA` and `axisB`.

  ```javascript
  var axisA = 0, axisB = 1
  var a = 2, b = 3, c = 4
  var single = AxisConstraint.create(axisA, axisB, a)
  var many = AxisConstraint.create(axisA, axisB, [a, b, c])
  ```

  @class AxisConstraint
  @extends Constraint
  @constructor
  @param {Int}       axisA  Particle index defining start of axis
  @param {Int}       axisB  Particle index defining end of axis
  @param {Int|Array} a      Particle index or list of many indices
*/
function AxisConstraint(axisA, axisB, a) {
  var size = a.length || 1

  Constraint.call(this, size, 1, 2)
  this.setAxis(axisA, axisB)
  this.setIndices(a)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(AxisConstraint, Constraint)

/**
  Set particles defining constraint axis

  @method setAxis
  @param {Int} a  Particle index defining start of axis
  @param {Int} b  Particle index defining end of axis
*/
AxisConstraint.prototype.setAxis = function (a, b) {
  var ii = this.indices

  ii[0] = a
  ii[1] = b
}

AxisConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ii = this.indices
  var ai = ii[0], bi = ii[index + 2], ci = ii[1]

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2

  // AB (A -> B)
  var abX = p0[bix] - p0[aix]
  var abY = p0[biy] - p0[aiy]
  var abZ = p0[biz] - p0[aiz]

  // AC (A -> C)
  var acX = p0[cix] - p0[aix]
  var acY = p0[ciy] - p0[aiy]
  var acZ = p0[ciz] - p0[aiz]

  var acLenSq = acX * acX + acY * acY + acZ * acZ
  var acLen = Math.sqrt(acLenSq)

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

  p0[bix] = p0[aix] + apX
  p0[biy] = p0[aiy] + apY
  p0[biz] = p0[aiz] + apZ
}
