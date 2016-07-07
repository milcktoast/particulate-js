module('Force')

var Force = Particulate.Force

test('Creation', function () {
  var forceA = Force.create()
  var forceB = Force.create([1, 2, 3], {
    type : Force.REPULSOR
  })

  equal(forceA.vector.length, 3,
    'Should initialize vector as vec3 array.')
  equal(forceA.type, Force.ATTRACTOR,
    'Should initialize type as attractor by default.')
  equal(forceB.type, Force.REPULSOR,
    'Should set type per constructor options.')
})
