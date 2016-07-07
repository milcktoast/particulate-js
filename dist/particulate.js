// ..................................................
// Particulate.js
//
// version : 0.3.3
// authors : Jay Weeks
// license : MIT
// particulatejs.org
// ..................................................

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Particulate = global.Particulate || {})));
}(this, function (exports) { 'use strict';

  /**
    @module utils
    @class Particulate
  */

  /**
    Functional constructor utility.

    @method ctor
    @param  {Function} Ctor         Constructor function used to instantiate class
    @return {Function} constructor
    @private
    @static
  */
  function ctor(Ctor) {
    return function () {
      var instance = Object.create(Ctor.prototype)
      Ctor.apply(instance, arguments)
      return instance
    }
  }

  /**
    Functional inheritance utility

    @method inherit
    @param {Function} Ctor        Class constructor
    @param {Function} ParentCtor  Parent class constructor
    @private
    @static
  */
  function inherit(Ctor, ParentCtor) {
    Ctor.create = ctor(Ctor)
    Ctor.prototype = Object.create(ParentCtor.prototype)
    Ctor.prototype.constructor = Ctor
  }

  /**
    @module math
    @main math
  */

  /**
    Math utilities.

    @class Math
    @static
  */

  /**
    Clamp value to `[min, max]` range.

    @method clamp
    @static
    @param  {Float} min
    @param  {Float} max
    @param  {Float} v    Value to clamp
    @return {Float} Clamped value
  */
  function clamp (min, max, v) {
    return Math.min(Math.max(v, min), max)
  }

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

  // ..................................................
  // Vec3
  // ..................................................

  var Vec3 = {}
  /**
    @module math
  */

  /**
    Vector utilities.

    @class Vec3
    @static
  */

  /**
    @method create
    @static
    @param  {Int|Array}    positions  Number of vectors or array of initial values
    @return {Float32Array} Vec3 buffer
  */
  Vec3.create = function (positions) {
    positions = positions || 1
    var isCount = typeof positions === 'number'
    return new Float32Array(isCount ? positions * 3 : positions)
  }

  /**
    Set single vector in buffer

    @method set
    @static
    @param {Array}        b0  Vec3 buffer
    @param {Int}          i   Vector index
    @param {Array|Float}  x   Vector or x component value
    @param {Float}       [y]
    @param {Float}       [z]
  */
  Vec3.set = function (b0, i, x, y, z) {
    var ix = i * 3, iy = ix + 1, iz = ix + 2

    if (y == null) {
      z = x[2]
      y = x[1]
      x = x[0]
    }

    b0[ix] = x
    b0[iy] = y
    b0[iz] = z
  }

  /**
    @method copy
    @static
    @param {Array} b0   Vec3 buffer
    @param {Int}   ai   Vector index
    @param {Array} out  Destination vector
  */
  Vec3.copy = function (b0, ai, out) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2

    out[0] = b0[aix]
    out[1] = b0[aiy]
    out[2] = b0[aiz]

    return out
  }

  /**
    @method lengthSq
    @static
    @param  {Array} b0   Vec3 buffer
    @param  {Int}   ai   Vector index
    @return {Float} Squared length of vector
  */
  Vec3.lengthSq = function (b0, ai) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var x = b0[aix]
    var y = b0[aiy]
    var z = b0[aiz]

    return x * x + y * y + z * z
  }

  /**
    @method length
    @static
    @param  {Array} b0   Vec3 buffer
    @param  {Int}   ai   Vector index
    @return {Float} Length of vector
  */
  Vec3.length = function (b0, ai) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var x = b0[aix]
    var y = b0[aiy]
    var z = b0[aiz]

    return Math.sqrt(x * x + y * y + z * z)
  }

  /**
    @method distanceSq
    @static
    @param  {Array} b0   Vec3 buffer
    @param  {Int}   ai   Vector index a
    @param  {Int}   bi   Vector index b
    @return {Float} Squared distance from a to b
  */
  Vec3.distanceSq = function (b0, ai, bi) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var bix = bi * 3, biy = bix + 1, biz = bix + 2

    var dx = b0[aix] - b0[bix]
    var dy = b0[aiy] - b0[biy]
    var dz = b0[aiz] - b0[biz]

    return dx * dx + dy * dy + dz * dz
  }

  /**
    @method distance
    @static
    @param  {Array} b0   Vec3 buffer
    @param  {Int}   ai   Vector index a
    @param  {Int}   bi   Vector index b
    @return {Float} Distance from a to b
  */
  Vec3.distance = function (b0, ai, bi) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var bix = bi * 3, biy = bix + 1, biz = bix + 2

    var dx = b0[aix] - b0[bix]
    var dy = b0[aiy] - b0[biy]
    var dz = b0[aiz] - b0[biz]

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  /**
    Normalize vector in place

    @method normalize
    @static
    @param {Array} b0  Vec3 buffer
    @param {Int}   ai  Vector index a
  */
  Vec3.normalize = function (b0, ai) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var x = b0[aix]
    var y = b0[aiy]
    var z = b0[aiz]
    var lenInv = 1 / Math.sqrt(x * x + y * y + z * z)

    b0[aix] *= lenInv
    b0[aiy] *= lenInv
    b0[aiz] *= lenInv
  }

  /**
    Calculate angle between segments `ab` and `bc`

    @method angle
    @static
    @param  {Array} b0   Vec3 buffer
    @param  {Int}   ai   Vector index a
    @param  {Int}   bi   Vector index b
    @param  {Int}   ci   Vector index c
    @return {Float} Angle in radians
  */
  Vec3.angle = function (b0, ai, bi, ci) {
    var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
    var bix = bi * 3, biy = bix + 1, biz = bix + 2
    var cix = ci * 3, ciy = cix + 1, ciz = cix + 2

    var baLenInv = 1 / Vec3.distance(b0, bi, ai)
    var bcLenInv = 1 / Vec3.distance(b0, bi, ci)

    var baX = (b0[aix] - b0[bix]) * baLenInv
    var baY = (b0[aiy] - b0[biy]) * baLenInv
    var baZ = (b0[aiz] - b0[biz]) * baLenInv

    var bcX = (b0[cix] - b0[bix]) * bcLenInv
    var bcY = (b0[ciy] - b0[biy]) * bcLenInv
    var bcZ = (b0[ciz] - b0[biz]) * bcLenInv

    var dot = baX * bcX + baY * bcY + baZ * bcZ

    return Math.acos(dot)
  }

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

  /**
    Forces are accumulated and applied to particles, affecting their
    acceleration and velocity in the system's integration step.

    @module forces
    @main forces
  */

  /**
    Base class for defining forces.

    @class Force
    @constructor
    @param {Array (Vec3)}  vector
    @param {Object}       [opts]       Options
    @param {Int (Enum)}   [opts.type]
  */
  function Force(vector, opts) {
    opts = opts || {}
    this.vector = new Float32Array(3)

    if (opts.type) { this.type = opts.type; }
    if (vector != null) { this.set(vector); }
  }

  /**
    Create instance, accepts constructor arguments.

    @method create
    @static
  */
  inherit(Force, Object)

  /**
    Force type enum: `Force.ATTRACTOR`, `Force.REPULSOR`, `Force.ATTRACTOR_REPULSOR`.

    @property type
    @type {Int (Enum)}
    @default Force.ATTRACTOR
  */
  Force.ATTRACTOR = 0
  Force.REPULSOR = 1
  Force.ATTRACTOR_REPULSOR = 2
  Force.prototype.type = Force.ATTRACTOR

  /**
    Alias for `Vec3.set`.

    @method set
    @param {Float} x
    @param {Float} y
    @param {Float} z
  */
  Force.prototype.set = function (x, y, z) {
    Vec3.set(this.vector, 0, x, y, z)
  }

  /**
    Apply force to one particle in system.

    @method applyForce
    @param {Int}                 ix  Particle vector `x` index
    @param {Float32Array (Vec3)} f0  Reference to `ParticleSystem.accumulatedForces`
    @param {Float32Array (Vec3)} p0  Reference to `ParticleSystem.positions`
    @param {Float32Array (Vec3)} p1  Reference to `ParticleSystem.positionsPrev`
    @protected
  */
  Force.prototype.applyForce = function (ix, f0, p0, p1) {}

  /**
    @module forces
  */

  /**
    Defines a directional force that affects all particles in the system.

    ```javascript
    var gravity = DirectionalForce.create([0.0, -0.1, 0.0])
    ```

    @class DirectionalForce
    @extends Force
    @constructor
    @param {Array (Vec3)} vector  Direction vector
  */
  function DirectionalForce(vector) {
    Force.call(this, vector)
  }

  /**
    Create instance, accepts constructor arguments.

    @method create
    @static
  */
  inherit(DirectionalForce, Force)

  DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1) {
    var v0 = this.vector
    f0[ix]     += v0[0]
    f0[ix + 1] += v0[1]
    f0[ix + 2] += v0[2]
  }

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

  /**
    @module utils
  */

  /**
    Collection utilities.

    @class Collection
    @static
  */

  /**
    Remove all instances of an object from an array.

    @method removeAll
    @param {Array} buffer  Collection of objects
    @param {any}   item    Item to remove from collection
  */
  function removeAll(buffer, item) {
    var index = buffer.indexOf(item)
    if (index < 0) { return; }

    for (var i = buffer.length - 1; i >= index; i --) {
      if (buffer[i] === item) {
        buffer.splice(i, 1)
      }
    }
  }

  /**
    @module systems
  */

  /**
    Manages particle state as well as the forces and constraints that act on its particles.

    @class ParticleSystem
    @constructor
    @param {Int|Array} particles   Number of particles or array of initial particle positions
    @param {Int}       iterations  Number of constraint iterations per system tick
  */
  function ParticleSystem(particles, iterations) {
    var isCount = typeof particles === 'number'
    var length = isCount ? particles * 3 : particles.length
    var count = length / 3
    var positions = isCount ? length : particles

    /**
      Current particle positions

      @property positions
      @type Float32Array (Vec3)
    */
    this.positions = new Float32Array(positions)

    /**
      Previous particle positions

      @property positionsPrev
      @type Float32Array (Vec3)
    */
    this.positionsPrev = new Float32Array(positions)

    /**
      Accumulated forces currently acting on particles

      @property accumulatedForces
      @type Float32Array (Vec3)
    */
    this.accumulatedForces = new Float32Array(length)

    /**
      Particle mass

      @property weights
      @type Float32Array (Float)
    */
    this.weights = new Float32Array(count)
    this.setWeights(1)

    /**
      Number of constraint relaxation loop iterations

      @property _iterations
      @type Int
      @private
    */
    this._iterations = iterations || 1

    /**
      Number of particles in system

      @property _count
      @type Int
      @private
    */
    this._count = count

    this._globalConstraints = []
    this._localConstraints = []
    this._pinConstraints = []
    this._forces = []
  }

  /**
    Create instance, accepts constructor arguments.

    @method create
    @static
  */
  inherit(ParticleSystem, Object)

  /**
    Alias for `Vec3.set`. Sets vector of `positions` and `positionsPrev`.

    @method setPosition
    @param {Int}   i  Particle index
    @param {Float} x
    @param {Float} y
    @param {Float} z
  */
  ParticleSystem.prototype.setPosition = function (i, x, y, z) {
    Vec3.set(this.positions, i, x, y, z)
    Vec3.set(this.positionsPrev, i, x, y, z)
  }

  /**
    Alias for `Vec3.copy`. Copys vector from `positions`.

    @method getPosition
    @param  {Int}  i    Particle index
    @param  {Vec3} out
    @return {Vec3} out
  */
  ParticleSystem.prototype.getPosition = function (i, out) {
    return Vec3.copy(this.positions, i, out)
  }

  /**
    Alias for `Vec3.getDistance`. Calculates distance from `positions`.

    @method getDistance
    @param  {Int}   a  Particle index
    @param  {Int}   b  Particle index
    @return {Float}    Distance
  */
  ParticleSystem.prototype.getDistance = function (a, b) {
    return Vec3.distance(this.positions, a, b)
  }

  /**
    Alias for `Vec3.angle`. Calculates angle from `positions`.

    @method getAngle
    @param  {Int}   a  Particle index
    @param  {Int}   b  Particle index
    @param  {Int}   c  Particle index
    @return {Float}    Angle in radians
  */
  ParticleSystem.prototype.getAngle = function (a, b, c) {
    return Vec3.angle(this.positions, a, b, c)
  }

  /**
    Set a particle's mass

    @method setWeight
    @param {Int}   i  Particle index
    @param {Float} w  Weight
  */
  ParticleSystem.prototype.setWeight = function (i, w) {
    this.weights[i] = w
  }

  ParticleSystem.prototype.setWeights = function (w) {
    var weights = this.weights
    for (var i = 0, il = weights.length; i < il; i ++) {
      weights[i] = w
    }
  }

  ParticleSystem.prototype.each = function (iterator, context) {
    context = context || this
    for (var i = 0, il = this._count; i < il; i ++) {
      iterator.call(context, i, this)
    }
  }

  ParticleSystem.prototype.perturb = function (scale) {
    var positions = this.positions
    var positionsPrev = this.positionsPrev
    var dist

    for (var i = 0, il = positions.length; i < il; i ++) {
      dist = Math.random() * scale
      positions[i] += dist
      positionsPrev[i] += dist
    }
  }

  // ..................................................
  // Verlet Integration
  //

  function ps_integrateParticle(i, p0, p1, f0, weight, d2) {
    var pt = p0[i]
    p0[i] += pt - p1[i] + f0[i] * weight * d2
    p1[i] = pt
  }

  /**
    Calculate particle's next position through Verlet integration.
    Called as part of `tick`.

    @method integrate
    @param {Float} delta  Time step
    @private
  */
  ParticleSystem.prototype.integrate = function (delta) {
    var d2 = delta * delta
    var p0 = this.positions
    var p1 = this.positionsPrev
    var f0 = this.accumulatedForces
    var w0 = this.weights
    var ix, weight

    for (var i = 0, il = this._count; i < il; i ++) {
      weight = w0[i]
      ix = i * 3

      ps_integrateParticle(ix,     p0, p1, f0, weight, d2)
      ps_integrateParticle(ix + 1, p0, p1, f0, weight, d2)
      ps_integrateParticle(ix + 2, p0, p1, f0, weight, d2)
    }
  }

  // ..................................................
  // Constraints
  //

  ParticleSystem.prototype._getConstraintBuffer = function (constraint) {
    return constraint._isGlobal ? this._globalConstraints : this._localConstraints
  }

  /**
    Add a constraint

    @method addConstraint
    @param {Constraint} constraint
  */
  ParticleSystem.prototype.addConstraint = function (constraint) {
    this._getConstraintBuffer(constraint).push(constraint)
  }

  /**
    Alias for `Collection.removeAll`. Remove all references to a constraint.

    @method removeConstraint
    @param {Constraint} constraint
  */
  ParticleSystem.prototype.removeConstraint = function (constraint) {
    removeAll(this._getConstraintBuffer(constraint), constraint)
  }

  /**
    Add a pin constraint.
    Although intended for instances of `PointConstraint`, this can be any
    type of constraint and will be resolved last in the relaxation loop.

    @method addPinConstraint
    @param {Constraint} constraint
  */
  ParticleSystem.prototype.addPinConstraint = function (constraint) {
    this._pinConstraints.push(constraint)
  }

  /**
    Alias for `Collection.removeAll`. Remove all references to a pin constraint.

    @method removePinConstraint
    @param {Constraint} constraint
  */
  ParticleSystem.prototype.removePinConstraint = function (constraint) {
    removeAll(this._pinConstraints, constraint)
  }

  /**
    Run relaxation loop, resolving constraints per defined iterations.
    Constraints are resolved in order by type: global, local, pin.

    @method satisfyConstraints
    @private
  */
  ParticleSystem.prototype.satisfyConstraints = function () {
    var iterations = this._iterations
    var global = this._globalConstraints
    var local = this._localConstraints
    var pins = this._pinConstraints
    var globalCount = this._count
    var globalItemSize = 3

    for (var i = 0; i < iterations; i ++) {
      this.satisfyConstraintGroup(global, globalCount, globalItemSize)
      this.satisfyConstraintGroup(local)

      if (!pins.length) { continue; }
      this.satisfyConstraintGroup(pins)
    }
  }

  /**
    Resolve a group of constraints.

    @method satisfyConstraintGroup
    @param {Array} group       List of constraints
    @param {Int}   [count]     Override for number of particles a constraint affects
    @param {Int}   [itemSize]  Override for particle index stride
    @private
  */
  ParticleSystem.prototype.satisfyConstraintGroup = function (group, count, itemSize) {
    var p0 = this.positions
    var p1 = this.positionsPrev
    var hasUniqueCount = !count
    var constraint

    for (var i = 0, il = group.length; i < il; i ++) {
      constraint = group[i]

      if (hasUniqueCount) {
        count = constraint._count
        itemSize = constraint._itemSize
      }

      for (var j = 0; j < count; j ++) {
        constraint.applyConstraint(j * itemSize, p0, p1)
      }
    }
  }

  // ..................................................
  // Forces
  //

  /**
    Add a force

    @method addForce
    @param {Force} force
  */
  ParticleSystem.prototype.addForce = function (force) {
    this._forces.push(force)
  }

  /**
    Alias for `Collection.removeAll`. Remove all references to a force.

    @method removeForce
    @param {Force} force
  */
  ParticleSystem.prototype.removeForce = function (force) {
    removeAll(this._forces, force)
  }

  /**
    Accumulate forces acting on particles.

    @method accumulateForces
    @param {Float} delta  Time step
    @private
  */
  ParticleSystem.prototype.accumulateForces = function (delta) {
    var forces = this._forces
    var f0 = this.accumulatedForces
    var p0 = this.positions
    var p1 = this.positionsPrev
    var ix

    for (var i = 0, il = this._count; i < il; i ++) {
      ix = i * 3
      f0[ix] = f0[ix + 1] = f0[ix + 2] = 0

      for (var j = 0, jl = forces.length; j < jl; j ++) {
        forces[j].applyForce(ix, f0, p0, p1)
      }
    }
  }

  /**
    Step simulation forward one frame.
    Applies forces, calculates particle positions, and resolves constraints.

    @method tick
    @param {Float} delta  Time step
  */
  ParticleSystem.prototype.tick = function (delta) {
    this.accumulateForces(delta)
    this.integrate(delta)
    this.satisfyConstraints()
  }

  /**
    @class Particulate
    @static
  */
  var VERSION = '0.3.3'

  exports.VERSION = VERSION;
  exports.AngleConstraint = AngleConstraint;
  exports.AxisConstraint = AxisConstraint;
  exports.BoundingPlaneConstraint = BoundingPlaneConstraint;
  exports.BoxConstraint = BoxConstraint;
  exports.Constraint = Constraint;
  exports.DistanceConstraint = DistanceConstraint;
  exports.PlaneConstraint = PlaneConstraint;
  exports.PointConstraint = PointConstraint;
  exports.DirectionalForce = DirectionalForce;
  exports.Force = Force;
  exports.PointForce = PointForce;
  exports.Vec3 = Vec3;
  exports.ParticleSystem = ParticleSystem;
  exports.ctor = ctor;
  exports.inherit = inherit;

  Object.defineProperty(exports, '__esModule', { value: true });

}));