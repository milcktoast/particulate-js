module('Constraint.Plane')

var ParticleSystem = Particulate.ParticleSystem
var PlaneConstraint = Particulate.PlaneConstraint
var Vec3 = Particulate.Vec3

test('Creation', function () {
  var pa = 0, pb = 1, pc = 2
  var a = 3
  var indices = [3, 4, 5]
  var fromArgs = PlaneConstraint.create(pa, pb, pc, a)
  var fromArray = PlaneConstraint.create(pa, pb, pc, indices)

  Test.assert.equalArray(fromArgs.indices, [pa, pb, pc, a],
    'Should create indices from int arguments.')
  Test.assert.equalArray(fromArray.indices, [pa, pb, pc].concat(indices),
    'Should create indices from int array.')
})

function testPlane(v0, v1, v2) {
  var system = ParticleSystem.create(10, 10)
  var singleIndex = 3
  var single = PlaneConstraint.create(0, 1, 2, singleIndex)
  var manyIndices = [4, 5, 6, 7, 8, 9]
  var many = PlaneConstraint.create(0, 1, 2, manyIndices)
  var pos = Vec3.create()

  function getZ(index) {
    return system.getPosition(index, pos)[2]
  }

  function returnTen() {
    return 10
  }

  system.setPosition(0, v0)
  system.setPosition(1, v1)
  system.setPosition(2, v2)

  system.addConstraint(single)
  system.addConstraint(many)
  system.tick(20)

  Test.assert.closeArray(many.bufferVec3, [0, 0, 1], 0.1,
    'Should cache plane normal vector.')
  Test.assert.close(getZ(singleIndex), 10, 0.1,
    'Should constrain single set of particles to plane.')
  Test.assert.closeArray(manyIndices.map(getZ), manyIndices.map(returnTen), 0.1,
    'Should constrain multiple sets of particles to plane.')
}

test('Application', function () {
  testPlane(
    [25, 15, 10],
    [10, 10, 10],
    [50, 30, 10])

  // Plane with parallel segments
  testPlane(
    [5, 5, 10],
    [10, 10, 10],
    [15, 15, 10])
})
