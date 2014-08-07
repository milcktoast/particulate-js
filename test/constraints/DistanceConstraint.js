module('Constraint.Distance');

var DistanceConstraint = Particulate.DistanceConstraint;

// Creation
// --------

test('Creation', function () {
  var dist = 2;
  var a = 1, b = 3;
  var indices = [0, 1, 2, 3];
  var fromArgs = DistanceConstraint.create(dist, a, b);
  var fromArray = DistanceConstraint.create(dist, indices);

  equal(fromArgs._distance2, dist * dist,
    'Should initialize precalculated distance^2.');
  Test.assert.equalArray(fromArgs.indices, [a, b],
    'Should create indices from int arguments.');
  Test.assert.equalArray(fromArray.indices, indices,
    'Should create indices from int array.');
});

// Application
// -----------

test('Application', function () {
  var system = Particulate.ParticleSystem.create(6, 10);
  var dist = 2;
  var a = 0, b = 1;
  var c = 2, d = 3, e = 4, f = 5;
  var single = DistanceConstraint.create(dist, a, b);
  var many = DistanceConstraint.create(dist, [c, d, e, f]);

  system.addConstraint(single);
  system.addConstraint(many);
  system.tick(1);

  Test.assert.close(system.getDistance(a, b), dist, 0.1,
    'Should move particles [a, b] toward constraint\'s distance.');
  Test.assert.close(system.getDistance(c, d), dist, 0.1,
    'Should move particles [c, d] toward constraint\'s distance.');
  Test.assert.close(system.getDistance(e, f), dist, 0.1,
    'Should move particles [e, f] toward constraint\'s distance.');
});
