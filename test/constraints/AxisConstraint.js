module('Constraint.Axis')

var ParticleSystem = Particulate.ParticleSystem
var AxisConstraint = Particulate.AxisConstraint
var Vec3 = Particulate.Vec3

test('Creation', function () {
  var start = 0, end = 1
  var a = 1
  var indices = [0, 1, 2]
  var fromArgs = AxisConstraint.create(start, end, a)
  var fromArray = AxisConstraint.create(start, end, indices)

  Test.assert.equalArray(fromArgs.indices, [start, end, a],
    'Should create indices from int arguments.')
  Test.assert.equalArray(fromArray.indices, [start, end].concat(indices),
    'Should create indices from int array.')
})

test('Application', function () {
  var system = ParticleSystem.create(6, 10)
  var start = 0, end = 1
  var single = AxisConstraint.create(start, end, 2)
  var many = AxisConstraint.create(start, end, [3, 4, 5])
  var posY = 10

  var pos = Vec3.create()
  function getY(index) {
    return system.getPosition(index, pos)[1]
  }

  system.perturb(20)
  system.setPosition(start, [10, posY, 0])
  system.setPosition(end,   [20, posY, 0])

  system.addConstraint(single)
  system.addConstraint(many)
  system.tick(1)

  Test.assert.close(getY(2), posY, 0.1,
    'Should constrain single particle to axis.')
  Test.assert.closeArray([getY(3), getY(4), getY(5)], [posY, posY, posY], 0.1,
    'Should constrain multiple particles to axis.')
})
