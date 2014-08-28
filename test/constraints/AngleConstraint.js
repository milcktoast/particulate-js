module('Constraint.Angle');

var AngleConstraint = Particulate.AngleConstraint;

// Creation
// --------

test('Creation', function () {
  var min = 2, max = 3;
  var a = 1, b = 3, c = 2;
  var indices = [0, 1, 2, 3, 4, 5];
  var fromArgs = AngleConstraint.create([min, max], a, b, c);
  var fromArray = AngleConstraint.create([min, max], indices);

  Test.assert.equalArray(fromArgs.indices, [a, b, c],
    'Should create indices from int arguments.');
  Test.assert.equalArray(fromArray.indices, indices,
    'Should create indices from int array.');
});

// Application
// -----------

function testAtAngle(angle) {
  var system = Particulate.ParticleSystem.create(9, 10);
  var dist = Particulate.DistanceConstraint.create(2, [0, 1, 1, 2]);
  var single = AngleConstraint.create(angle, 0, 1, 2);

  system.setPosition(0, [1, 0, 0]);
  system.setPosition(1, [2, 2, 0]);
  system.setPosition(2, [3, 0, 0]);

  system.addConstraint(dist);
  system.addConstraint(single);
  system.tick(1);

  var approxAngle = ('' + angle).slice(0, 5);
  Test.assert.close(system.getAngle(0, 1, 2), angle, 0.1,
    'Should constrain particles to ' + approxAngle + ' radians.');
}

test('Application of angles', function () {
  var angles = 10;
  for (var i = 0; i < angles; i ++) {
    testAtAngle(Math.PI * i / (angles - 1));
  }
});
