import { removeAll } from '../utils/Collection'
import { inherit } from '../utils/Creator'
import { Vec3 } from '../math/Vec3'

// ..................................................
// ParticleSystem
// ..................................................

export { ParticleSystem }

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
