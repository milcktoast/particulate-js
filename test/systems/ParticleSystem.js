module('ParticleSystem');

var ParticleSystem = Particulate.ParticleSystem;

// Creation
// --------

function test_systemArrays(system, size) {
  equal(system.positions.length, size,
    'Should initialize positions as vec3 array.');
  equal(system.positionsPrev.length, size,
    'Should initialize positionsPrev as vec3 array.');
  equal(system.accumulatedForces.length, size,
    'Should initialize accumulatedForces as vec3 array.');
  equal(system.weights.length, size / 3,
    'Should initialize weights as float array.');
}

function test_systemPositions(system, positions) {
  Test.assert.equalArray(system.positions, positions,
    'Should initialize positions with passed values.');
  Test.assert.equalArray(system.positionsPrev, positions,
    'Should initialize positionsPrev with passed values.');
}

test('Creation from particle count', function () {
  var particles = 3;
  var system = ParticleSystem.create(particles);
  test_systemArrays(system, particles * 3);
});

test('Creation from positions array', function () {
  var positions = [1, 1, 1, 2, 2, 2, 3, 3, 3];
  var system = ParticleSystem.create(positions);
  var size = positions.length;

  test_systemArrays(system, size);
  test_systemPositions(system, positions);
});

// Constraints
// -----------

test('Adding and removing local constraints', function () {
  var system = ParticleSystem.create(10);
  var constraint = Particulate.Constraint.create();
  var local = system._localConstraints;

  system.addConstraint(constraint);
  equal(local.length, 1, 'Should add new local constraints to _localConstraints.');

  system.addConstraint(constraint);
  equal(local.length, 1, 'Should not add duplicate constraints.');

  system.removeConstraint(constraint);
  equal(local.length, 0, 'Should remove local constraints from _localConstraints.');
});

test('Adding and removing pin constraints', function () {
  var system = ParticleSystem.create(10);
  var constraint = Particulate.Constraint.create();
  var pin = system._pinConstraints;

  system.addPinConstraint(constraint);
  equal(pin.length, 1, 'Should add new pin constraints to _pinConstraints.');

  system.addPinConstraint(constraint);
  equal(pin.length, 1, 'Should not add duplicate constraints.');

  system.removePinConstraint(constraint);
  equal(pin.length, 0, 'Should remove pin constraints from _pinConstraints.');
});

// Forces
// ------

test('Adding and removing forces', function () {
  var system = ParticleSystem.create(10);
  var force = Particulate.Force.create();
  var forces = system._forces;

  system.addForce(force);
  equal(forces.length, 1, 'Should add new forces to _forces.');

  system.addForce(force);
  equal(forces.length, 1, 'Should not add duplicate forces.');

  system.removeForce(force);
  equal(forces.length, 0, 'Should remove forces from _forces.');
});

// Weights
// -------

test('Setting weights', function () {
  var system = ParticleSystem.create(3);
  var weights = system.weights;

  Test.assert.equalArray(weights, [1, 1, 1],
    'Should initialize weights with neutral value of 1.');

  system.setWeight(1, 2);
  equal(weights[1], 2, 'Should set particle weight at index.');

  system.setWeights(3);
  Test.assert.equalArray(weights, [3, 3, 3], 'Should set all weights.');
});
