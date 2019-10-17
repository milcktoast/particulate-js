QUnit.module('Force')

var Force = Particulate.Force

QUnit.test('Creation', function (assert) {
  var forceA = Force.create()
  var forceB = Force.create([1, 2, 3], {
    type : Force.REPULSOR
  })

  assert.equal(forceA.vector.length, 3,
    'Should initialize vector as vec3 array.')
  assert.equal(forceA.type, Force.ATTRACTOR,
    'Should initialize type as attractor by default.')
  assert.equal(forceB.type, Force.REPULSOR,
    'Should set type per constructor options.')
})
