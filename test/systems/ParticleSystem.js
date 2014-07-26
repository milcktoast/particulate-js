module('ParticleSystem');

var ParticleSystem = Particulate.ParticleSystem;
var slice = Array.prototype.slice;

function assert_equalArray(actual, expected, message) {
  var isEqual = true;

  for (var i = 0, il = expected.length; i < il; i ++) {
    if (actual[i] !== expected[i]) {
      isEqual = false;
      break;
    }
  }

  QUnit.push(isEqual, actual, expected, message);
}

// Creation
// --------

function test_systemArrays(system, size) {
  equal(system.positions.length, size,
    'Should initialize positions as vec3 array.');
  equal(system.positionsPrev.length, size,
    'Should initialize positionsPrev as vec3 array.');
  equal(system.accumulatedForces.length, size,
    'Should initialize accumulatedForces as vec3 array.');
}

function test_systemPositions(system, positions) {
  assert_equalArray(system.positions, positions,
    'Should initialize positions with passed values.');
  assert_equalArray(system.positionsPrev, positions,
    'Should initialize positionsPrev with passed values.');
}

test('Creation from particle count', function () {
  var particles = 10;
  var system = new ParticleSystem(particles);
  test_systemArrays(system, particles * 3);
});

test('Creation from positions array', function () {
  var positions = [1, 1, 1, 2, 2, 2, 3, 3, 3];
  var system = new ParticleSystem(positions);
  var size = positions.length;

  test_systemArrays(system, size);
  test_systemPositions(system, positions);
});

// Constraints
// -----------

test('Adding constraints', function () {
  var system = new ParticleSystem(10);
  var constraint = new Particulate.Constraint();
  system.addConstraint(constraint);

  equal(system._localConstraints.length, 1,
    'Should push new local constraints to _localConstraints.');
});

// Forces
// ------

test('Adding forces', function () {
  var system = new ParticleSystem(10);
  var force = new Particulate.Force();
  system.addForce(force);

  equal(system._forces.length, 1,
    'Should push new forces to _forces.');
});

// Helpers
// -------

test('Setting a particle\'s position', function () {
  var system = new ParticleSystem(10);
  var position = [3, 4, 5];
  var index = 1;
  var ix = index * 3;

  system.setPosition(index,
    position[0],
    position[1],
    position[2]);

  var p0 = slice.call(system.positions, ix, ix + 3);
  var p1 = slice.call(system.positionsPrev, ix, ix + 3);

  assert_equalArray(p0, position, 'Should set the vec3 in positions.');
  assert_equalArray(p1, position, 'Should set the vec3 in positionsPrev.');
});
