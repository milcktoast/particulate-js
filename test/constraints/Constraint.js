module('Constraint');

var Constraint = Particulate.Constraint;

test('Creation', function () {
  var constraint = new Constraint(3);

  equal(constraint.indices.length, 3,
    'Should initialize indices as int array.');
});

test('Setting indices', function () {
  var a = 1, b = 4;
  var indices = [a, b];
  var constraint = new Constraint();

  constraint.setIndices(a, b);
  Test.assert.equalArray(constraint.indices, indices,
    'Should set indices from integers.');

  constraint.setIndices(indices);
  Test.assert.equalArray(constraint.indices, indices,
    'Should set indices from array.');
});
