module('Constraint.Distance')

var DistanceConstraint = Particulate.DistanceConstraint

// Creation
// --------

test('Creation', function () {
  var min = 2, max = 3
  var a = 1, b = 3
  var indices = [0, 1, 2, 3]
  var fromArgs = DistanceConstraint.create([min, max], a, b)
  var fromArray = DistanceConstraint.create([min, max], indices)

  equal(fromArgs._min2, min * min,
    'Should initialize precalculated min^2.')
  equal(fromArgs._max2, max * max,
    'Should initialize precalculated max^2.')
  Test.assert.equalArray(fromArgs.indices, [a, b],
    'Should create indices from int arguments.')
  Test.assert.equalArray(fromArray.indices, indices,
    'Should create indices from int array.')
})

// Application
// -----------

test('Application of distance', function () {
  var system = Particulate.ParticleSystem.create(6, 10)
  var dist = 2
  var single = DistanceConstraint.create(dist, 0, 1)
  var many = DistanceConstraint.create(dist, [2, 3, 4, 5])

  system.addConstraint(single)
  system.addConstraint(many)
  system.tick(1)

  var dist0 = system.getDistance(0, 1)
  var dist1 = system.getDistance(2, 3)
  var dist2 = system.getDistance(4, 5)

  Test.assert.close(dist0, dist, 0.1,
    'Should constrain single set of particles to distance.')
  Test.assert.closeArray([dist1, dist2], [dist, dist], 0.1,
    'Should constrain multiple sets of particles to distance.')
})

test('Application of distance range', function () {
  var system = Particulate.ParticleSystem.create(6, 10)
  var noMin = DistanceConstraint.create([0, 2], 0, 1)
  var noMax = DistanceConstraint.create([2, Infinity], 2, 3)
  var range = DistanceConstraint.create([2, 4], 4, 5)

  system.addConstraint(noMin)
  system.addConstraint(noMax)
  system.addConstraint(range)

  system.setPosition(2, [10, 0, 0])
  system.tick(1)

  Test.assert.range(system.getDistance(0, 1), 0, 2,
    'Should not affect coincident particles if lower bound is 0.')
  Test.assert.range(system.getDistance(2, 3), 2, Infinity,
    'Should not affect particles within range tolerance.')

  system.setPosition(2, [1, 0, 0])
  system.setPosition(4, [6, 0, 0])
  system.tick(1)

  Test.assert.range(system.getDistance(2, 3), 2, Infinity,
    'Should constrain particles if distance is less than lower bound of range.')
  Test.assert.range(system.getDistance(4, 5), 2, 4,
    'Should constrain particles if distance is greater than upper bound of range.')
})
