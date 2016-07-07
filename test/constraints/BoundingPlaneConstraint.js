module('Constraint.BoundingPlane')

var ParticleSystem = Particulate.ParticleSystem
var BoundingPlaneConstraint = Particulate.BoundingPlaneConstraint
var Vec3 = Particulate.Vec3

test('Creation', function () {
  var origin = [0, 1, 2]
  var normal = [0, 1, 0]
  var constraint = BoundingPlaneConstraint.create(origin, normal)

  Test.assert.equalArray(constraint.bufferVec3, [].concat(origin, normal),
    'Should initialize origin and normal vec3s.')
})

test('Application', function () {
  var system = ParticleSystem.create(2, 10)
  var origin = [5, 6, 7]
  var normal = [0, 0, 1]
  var constraint = BoundingPlaneConstraint.create(origin, normal)
  var pos = Vec3.create()

  system.setPosition(0, [10, 5, 20])
  system.setPosition(1, [10, 10, 10])
  system.addConstraint(constraint)
  system.tick(1)

  Test.assert.range(system.getPosition(0, pos)[2], origin[2], Infinity,
    'Should constrain particles behind plane.')
  Test.assert.equalArray(system.getPosition(1, pos), [10, 10, 10],
    'Should not affect particles in front of plane.')
})

test('Application with distance influence', function () {
  var system = ParticleSystem.create(2, 10)
  var origin = [5, 6, 7]
  var normal = [0, 0, 1]
  var distance = Infinity
  var constraint = BoundingPlaneConstraint.create(origin, normal, distance)
  var pos = Vec3.create()

  system.setPosition(0, [10, 5, 20])
  system.setPosition(1, [10, 10, 10])
  system.addConstraint(constraint)
  system.tick(1)

  Test.assert.close(system.getPosition(0, pos)[2], origin[2], 0.1,
    'Should constrain particles behind plane.')
  Test.assert.close(system.getPosition(1, pos)[2], origin[2], 0.1,
    'Should constrain particles in front of plane within distance influence.')
})
