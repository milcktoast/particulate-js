module('Constraint.Angle')

var AngleConstraint = Particulate.AngleConstraint
var PI = Math.PI

// Creation
// --------

test('Creation', function () {
  var min = 2, max = 3
  var a = 1, b = 3, c = 2
  var indices = [0, 1, 2, 3, 4, 5]
  var fromArgs = AngleConstraint.create([min, max], a, b, c)
  var fromArray = AngleConstraint.create([min, max], indices)

  Test.assert.equalArray(fromArgs.indices, [a, b, c],
    'Should create indices from int arguments.')
  Test.assert.equalArray(fromArray.indices, indices,
    'Should create indices from int array.')
})

// Application
// -----------

function testAtAngle(angle, makePerturbed) {
  var system = Particulate.ParticleSystem.create(3, 50)
  var single = AngleConstraint.create(angle, 0, 1, 2)

  if (makePerturbed) {
    system.perturb(0.5)
  }

  system.addConstraint(single)
  system.tick(1)

  var approxAngle = ('' + angle).slice(0, 5)
  var message = makePerturbed ?
    'Should constrain particles to ' + approxAngle + ' radians.' :
    'Should constrain coincident particles to ' + approxAngle + ' radians.'

  Test.assert.close(system.getAngle(0, 1, 2), angle, 0.1, message)
}

test('Application of angle', function () {
  var angles = 10
  var angle
  for (var i = 0; i < angles; i ++) {
    angle = PI * i / (angles - 1)
    testAtAngle(angle, true)
    testAtAngle(angle, false)
  }
})

test('Application of angle range', function () {
  var system = Particulate.ParticleSystem.create(9, 50)
  var noMin = AngleConstraint.create([0, PI * 0.25],         0, 1, 2)
  var noMax = AngleConstraint.create([PI * 0.25, Infinity],  3, 4, 5)
  var range = AngleConstraint.create([PI * 0.25, PI * 0.75], 6, 7, 8)
  var tolerance = 0.1

  system.setPosition(0, [  0, 10, 0])
  system.setPosition(2, [ 10,  0, 0])
  system.setPosition(3, [ 10,  2, 0])
  system.setPosition(5, [ 10,  1, 0])
  system.setPosition(6, [-10,  0, 0])
  system.setPosition(8, [ 10,  0, 0])

  system.addConstraint(noMin)
  system.addConstraint(noMax)
  system.addConstraint(range)
  system.tick(1)

  Test.assert.range(system.getAngle(0, 1, 2), noMin._min - tolerance, noMin._max + tolerance,
    'Should constrain particles if angle is greater than upper bound of range.')
  Test.assert.range(system.getAngle(3, 4, 5), noMax._min - tolerance, noMax._max + tolerance,
    'Should constrain particles if angle is less than lower bound of range.')
  Test.assert.range(system.getAngle(6, 7, 8), range._min - tolerance, range._max + tolerance,
    'Should not affect particles within range tolerance.')
})
