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

test('Application of angle', function () {
  var system = Particulate.ParticleSystem.create(9, 15);
  var angle = Math.PI * 0.5;
  var single = AngleConstraint.create(angle, 0, 1, 2);

  system.setPosition(0, [0, 1, 0]);
  system.setPosition(2, [1, 1, 0]);

  system.addConstraint(single);
  system.tick(1);

  var angle0 = system.getAngle(0, 1, 2);

  Test.assert.close(angle0, angle, 0.1,
    'Should constrain single set of particles to angle.');
});
