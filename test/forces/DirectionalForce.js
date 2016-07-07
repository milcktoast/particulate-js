module('Force.Directional')

var ParticleSystem = Particulate.ParticleSystem
var DirectionalForce = Particulate.DirectionalForce
var Vec3 = Particulate.Vec3

test('Application', function () {
  var system = ParticleSystem.create(4, 10)
  var force = DirectionalForce.create([0, 1, 2])

  system.addForce(force)
  system.tick(1)

  var accumulated = Vec3.create(4)
  system.each(function (i, system) {
    Vec3.set(accumulated, i, force.vector)
  })

  Test.assert.equalArray(system.accumulatedForces, accumulated,
    'Should be directly applied to all particles.')
})
