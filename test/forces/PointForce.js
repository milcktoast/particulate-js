QUnit.module('Force.Point')

var PointForce = Particulate.PointForce

// Creation
// --------

QUnit.test('Creation', function (assert) {
  var radius = 4
  var force = PointForce.create([1, 2, 3], {
    radius : radius
  })

  assert.equal(force._radius2, radius * radius,
    'Should initialize precalculated radius^2.')
})

// Application
// -----------

QUnit.test('Application of attractor', function (assert) {
  var point = [0, 1, 2]
  var radius = 20
  var system = Particulate.ParticleSystem.create(4, 10)
  var force = PointForce.create(point, {
    radius : radius
  })

  system.setPosition(0, point)
  system.setPosition(1, 30, 30, 30)

  var dist0 = system.getDistance(0, 2)
  var dist1A = system.getDistance(0, 1)

  system.addForce(force)
  system.tick(1)

  var dist1B = system.getDistance(0, 1)

  assert.ok(dist1B < dist1A,
    'Attractor should move particles outside its radius toward defined point.')
  assert.equal(system.getDistance(0, 2), dist0,
    'Attractor should not affect particles within its radius.')
})

QUnit.test('Application of repulsor', function (assert) {
  var point = [0, 1, 2]
  var radius = 20
  var system = Particulate.ParticleSystem.create(4, 10)
  var force = PointForce.create(point, {
    type : Particulate.Force.REPULSOR,
    radius : radius
  })

  system.setPosition(0, point)
  system.setPosition(1, 30, 30, 30)

  var dist0 = system.getDistance(0, 1)
  var dist1A = system.getDistance(0, 2)

  system.addForce(force)
  system.tick(1)

  var dist1B = system.getDistance(0, 2)

  assert.ok(dist1B > dist1A,
    'Repulsor should move particles within its radius away from defined point.')
  assert.equal(system.getDistance(0, 1), dist0,
    'Repulsor should not affect particles outside its radius.')
})

QUnit.test('Application of attractor/repulsor', function (assert) {
  var point = [0, 1, 2]
  var radius = 20
  var system = Particulate.ParticleSystem.create(4, 10)
  var force = PointForce.create(point, {
    type : Particulate.Force.ATTRACTOR_REPULSOR,
    radius : radius
  })

  system.setPosition(0, point)
  system.setPosition(1, 30, 30, 30)

  var dist0A = system.getDistance(0, 1)
  var dist1A = system.getDistance(0, 2)

  system.addForce(force)
  system.tick(1)

  var dist0B = system.getDistance(0, 1)
  var dist1B = system.getDistance(0, 2)

  assert.ok(dist1B > dist1A,
    'Attractor/Repulsor should move particles within its radius away from defined point.')
  assert.ok(dist0B < dist0A,
    'Attractor/Repulsor should move particles outside its radius toward defined point.')
})
