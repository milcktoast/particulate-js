import { inherit } from '../utils/Creator'
import { Vec3 } from '../math/Vec3'
import { Constraint } from './Constraint'

// ..................................................
// PlaneConstraint
// ..................................................

export { PlaneConstraint }

/**
  @module constraints
*/

/**
  Defines one or many relationships between an infinite plane and single particles.

  Orientaiton of the plane is defined by 3 points: `planeA`, `planeB`, and `planeC`.

  ```javascript
  var planeA = 0, planeB = 1, planeC = 2
  var a = 3, b = 4, c = 5
  var single = PlaneConstraint.create(planeA, planeB, planeC, a)
  var many = PlaneConstraint.create(planeA, planeB, planeC, [a, b, c])
  ```

  @class PlaneConstraint
  @extends Constraint
  @constructor
  @param {Int}       planeA  Particle index defining point on plane
  @param {Int}       planeB  Particle index defining point on plane
  @param {Int}       planeC  Particle index defining point on plane
  @param {Int|Array} a       Particle index or list of many indices
*/
function PlaneConstraint(planeA, planeB, planeC, a) {
  var size = a.length || 1

  Constraint.call(this, size, 1, 3)

  /**
    Vec3 buffer which stores plane normal.

    @property bufferVec3
    @type Float32Array (Vec3)
    @private
  */
  this.bufferVec3 = Vec3.create(1)

  this.setPlane(planeA, planeB, planeC)
  this.setIndices(a)
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
inherit(PlaneConstraint, Constraint)

/**
  Set particles defining constraint plane

  @method setPlane
  @param {Int} a  Particle index point on plane
  @param {Int} b  Particle index point on plane
  @param {Int} c  Particle index point on plane
*/
PlaneConstraint.prototype.setPlane = function (a, b, c) {
  var ii = this.indices

  ii[0] = a
  ii[1] = b
  ii[2] = c
}

/**
  Calculate and cache plane normal vector.
  Calculated once per relaxation loop iteration.

  @method _calculateNormal
  @param {Int}                 index  Constraint set index
  @param {Float32Array (Vec3)} p0     Reference to `ParticleSystem.positions`
  @private
*/
PlaneConstraint.prototype._calculateNormal = function (index, p0) {
  var b0 = this.bufferVec3
  var ii = this.indices
  var ai = ii[0], bi = ii[1], ci = ii[2]

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2

  // AB (B -> A)
  var abX = p0[aix] - p0[bix]
  var abY = p0[aiy] - p0[biy]
  var abZ = p0[aiz] - p0[biz]

  // BC (B -> C)
  var bcX = p0[cix] - p0[bix]
  var bcY = p0[ciy] - p0[biy]
  var bcZ = p0[ciz] - p0[biz]

  // N (plane normal vector)
  var nX = abY * bcZ - abZ * bcY
  var nY = abZ * bcX - abX * bcZ
  var nZ = abX * bcY - abY * bcX
  var nLenSq = nX * nX + nY * nY + nZ * nZ

  // AB and BC are parallel
  if (!nLenSq) {
    p0[aix] += 0.1
    p0[biy] += 0.1
    p0[cix] -= 0.1

    this._hasNormal = false
    return
  }

  var nLenInv = 1 / Math.sqrt(nLenSq)
  b0[0] = nX * nLenInv
  b0[1] = nY * nLenInv
  b0[2] = nZ * nLenInv

  this._hasNormal = true
}

/**
  State of constraint's plane normal resolution

  @property _hasNormal
  @type Bool
  @private
*/
PlaneConstraint.prototype._hasNormal = false

PlaneConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var b0 = this.bufferVec3
  var ii = this.indices
  var bi = ii[1], pi = ii[index + 3]

  var bix = bi * 3, biy = bix + 1, biz = bix + 2
  var pix = pi * 3, piy = pix + 1, piz = pix + 2

  if (index === 0) {
    this._calculateNormal(index, p0)
  }

  if (!this._hasNormal) { return; }

  // N (plane normal vector)
  var nX = b0[0]
  var nY = b0[1]
  var nZ = b0[2]

  // BP (B -> P)
  var opX = p0[pix] - p0[bix]
  var opY = p0[piy] - p0[biy]
  var opZ = p0[piz] - p0[biz]

  // Project BP onto normal vector N
  var pt = opX * nX + opY * nY + opZ * nZ

  p0[pix] -= nX * pt
  p0[piy] -= nY * pt
  p0[piz] -= nZ * pt
}
