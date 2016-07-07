module('Constraint.Box')

var BoxConstraint = Particulate.BoxConstraint
var Vec3 = Particulate.Vec3

// Creation
// --------

test('Creation', function () {
  var min = [-10, -10, -10]
  var max = [ 10,  10,  10]
  var constraint = BoxConstraint.create(min, max)

  Test.assert.equalArray(constraint.bufferVec3, [].concat(min, max),
    'Should initialize bounds from min and max vec3s.')
})

// Application
// -----------

test('Application', function () {
  var system = Particulate.ParticleSystem.create(4, 10)
  var min = [-1, -2, -3]
  var max = [ 4,  5,  6]
  var constraint = BoxConstraint.create(min, max)

  system.setPosition(0, 20, -20, -50)
  system.addConstraint(constraint)
  system.tick(1)

  var pos0 = system.getPosition(0, Vec3.create())

  Test.assert.range(pos0[0], min[0], max[0], 'Should bound x position.')
  Test.assert.range(pos0[1], min[1], max[1], 'Should bound y position.')
  Test.assert.range(pos0[2], min[2], max[2], 'Should bound z position.')
})
