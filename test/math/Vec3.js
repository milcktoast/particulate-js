QUnit.module('Vec3')

var Vec3 = Particulate.Vec3
var slice = Array.prototype.slice

QUnit.test('Setting a vector of a float buffer', function (assert) {
  var buffer = new Float32Array(9)
  var v0 = [1, 2, 3]
  var v1 = [4, 5, 6]
  var v2 = [7, 8, 9]

  Vec3.set(buffer, 0, v0)
  Vec3.set(buffer, 1, v1)
  Vec3.set(buffer, 2, v2[0], v2[1], v2[2])

  assert.equalArray(slice.call(buffer, 0, 3), v0, 'Should set first vec3 from vec3.')
  assert.equalArray(slice.call(buffer, 3, 6), v1, 'Should set second vec3 from vec3.')
  assert.equalArray(slice.call(buffer, 6, 9), v2, 'Should set third vec3 from floats.')
})

QUnit.test('Getting a vector from a float buffer', function (assert) {
  var v0 = [0, 1, 2]
  var v1 = [3, 4, 5]
  var buffer = new Float32Array([].concat(v0, v1))

  var b0 = Vec3.copy(buffer, 0, Vec3.create())
  var b1 = Vec3.copy(buffer, 1, Vec3.create())

  assert.equalArray(b0, v0, 'Should get first vec3.')
  assert.equalArray(b1, v1, 'Should get second vec3.')
})

QUnit.test('Calculating vector length', function (assert) {
  var length = 3.742
  var v0 = Vec3.create([1, 2, 3])

  assert.close(Vec3.length(v0, 0), length, 0.01,
    'Should calculate length.')
  assert.close(Vec3.lengthSq(v0, 0), length * length, 0.01,
    'Should calculate squared length.')
})

QUnit.test('Calculating vector distance', function (assert) {
  var length = 1.732
  var buffer = Vec3.create([1, 2, 3, 2, 3, 4])

  assert.close(Vec3.distance(buffer, 0, 1), length, 0.1,
    'Should calculate distance.')
  assert.close(Vec3.distanceSq(buffer, 0, 1), length * length, 0.1,
    'Should calculate squared distance.')
})

QUnit.test('Normalizing a vector', function (assert) {
  var buffer = Vec3.create([1, 10, 5])

  Vec3.normalize(buffer, 0)

  assert.close(Vec3.length(buffer, 0), 1, 0.01,
    'Should normalize vector in place.')
})

QUnit.test('Calculating vector angle', function (assert) {
  var angle = 2.145
  var buffer = Vec3.create([
    1, 2, 3,
    6, 5, 4,
    7, 8, 9
  ])

  assert.close(Vec3.angle(buffer, 0, 1, 2), angle, 0.01,
    'Should calculate angle between vectors.')
})
