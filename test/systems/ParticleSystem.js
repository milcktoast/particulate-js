QUnit.module('System.Particle')

var ParticleSystem = Particulate.ParticleSystem

// Creation
// --------

function test_systemArrays(assert, system, size) {
  assert.equal(system.positions.length, size,
    'Should initialize positions as vec3 array.')
  assert.equal(system.positionsPrev.length, size,
    'Should initialize positionsPrev as vec3 array.')
  assert.equal(system.accumulatedForces.length, size,
    'Should initialize accumulatedForces as vec3 array.')
  assert.equal(system.weights.length, size / 3,
    'Should initialize weights as float array.')
}

function test_systemPositions(assert, system, positions) {
  assert.equalArray(system.positions, positions,
    'Should initialize positions with passed values.')
  assert.equalArray(system.positionsPrev, positions,
    'Should initialize positionsPrev with passed values.')
}

QUnit.test('Creation from particle count', function (assert) {
  var particles = 3
  var system = ParticleSystem.create(particles)
  test_systemArrays(assert, system, particles * 3)
})

QUnit.test('Creation from positions array', function (assert) {
  var positions = [1, 1, 1, 2, 2, 2, 3, 3, 3]
  var system = ParticleSystem.create(positions)
  var size = positions.length

  test_systemArrays(assert, system, size)
  test_systemPositions(assert, system, positions)
})

// Constraints
// -----------

QUnit.test('Adding and removing local constraints', function (assert) {
  var system = ParticleSystem.create(10)
  var constraint = Particulate.Constraint.create()
  var local = system._localConstraints

  system.addConstraint(constraint)
  assert.equal(local.length, 1, 'Should add local constraint.')

  system.addConstraint(constraint)
  assert.equal(local.length, 2, 'Should allow adding duplicate constraints.')

  system.removeConstraint(constraint)
  assert.equal(local.length, 0, 'Should remove all instances of constraint.')
})

QUnit.test('Adding and removing pin constraints', function (assert) {
  var system = ParticleSystem.create(10)
  var constraint = Particulate.Constraint.create()
  var pin = system._pinConstraints

  system.addPinConstraint(constraint)
  assert.equal(pin.length, 1, 'Should add pin constraint.')

  system.addPinConstraint(constraint)
  assert.equal(pin.length, 2, 'Should allow adding duplicate constraints.')

  system.removePinConstraint(constraint)
  assert.equal(pin.length, 0, 'Should remove all instances of constraint.')
})

// Forces
// ------

QUnit.test('Adding and removing forces', function (assert) {
  var system = ParticleSystem.create(10)
  var force = Particulate.Force.create()
  var forces = system._forces

  system.addForce(force)
  assert.equal(forces.length, 1, 'Should add force.')

  system.addForce(force)
  assert.equal(forces.length, 2, 'Should allow adding duplicate forces.')

  system.removeForce(force)
  assert.equal(forces.length, 0, 'Should remove all instances of force.')
})

// Weights
// -------

QUnit.test('Setting weights', function (assert) {
  var system = ParticleSystem.create(3)
  var weights = system.weights

  assert.equalArray(weights, [1, 1, 1],
    'Should initialize weights with neutral value of 1.')

  system.setWeight(1, 2)
  assert.equal(weights[1], 2, 'Should set particle weight at index.')

  system.setWeights(3)
  assert.equalArray(weights, [3, 3, 3], 'Should set all weights.')
})
