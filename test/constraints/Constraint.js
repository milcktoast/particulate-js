QUnit.module('Constraint')

var Constraint = Particulate.Constraint

QUnit.test('Creation', function (assert) {
  var constraint = Constraint.create(3, 1)

  assert.equal(constraint.indices.length, 3,
    'Should initialize indices as int array.')
})

QUnit.test('Setting indices', function (assert) {
  var a = 1, b = 4
  var indices = [a, b]
  var constraint = Constraint.create(2, 1)

  constraint.setIndices(a, b)
  assert.equalArray(constraint.indices, indices,
    'Should set indices from integers.')

  constraint.setIndices(indices)
  assert.equalArray(constraint.indices, indices,
    'Should set indices from array.')
})

QUnit.test('Setting indices with index offset', function (assert) {
  var a = 1, b = 4
  var size = 2, itemSize = 1, offset = 3
  var indices = [a, b]
  var expectedIndices = [0, 0, 0, a, b]
  var constraint = Constraint.create(size, itemSize, offset)

  constraint.setIndices(a, b)
  assert.equalArray(constraint.indices, expectedIndices,
    'Should set indices from integers.')

  constraint.setIndices(indices)
  assert.equalArray(constraint.indices, expectedIndices,
    'Should set indices from array.')
})
