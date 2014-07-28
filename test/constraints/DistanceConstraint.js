module('Constraint.Distance');

var DistanceConstraint = Particulate.DistanceConstraint;

// Creation
// --------

test('Creation', function () {
  var dist = 2;
  var a = 1, b = 3;
  var constraint = DistanceConstraint.create(dist, a, b);

  equal(constraint._distance2, dist * dist,
    'Should initialize precalculated distance^2.');
});

// Application
// -----------

test('Application', function () {
  var system = Particulate.ParticleSystem.create(4, 10);
  var dist = 2;
  var a = 1, b = 3;
  var constraint = DistanceConstraint.create(dist, a, b);

  system.addConstraint(constraint);
  system.tick(1);

  Test.assert.close(system.getDistance(a, b), dist, 0.1,
    'Should move particles toward constraint\'s distance.');
});
