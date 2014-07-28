module('Force.Directional');

var DirectionalForce = Particulate.DirectionalForce;
var push = Array.prototype.push;

test('Application', function () {
  var system = Particulate.ParticleSystem.create(4, 10);
  var force = DirectionalForce.create([0, 1, 2]);

  system.addForce(force);
  system.tick(1);

  var accumulated = [];
  system.each(function () {
    push.apply(accumulated, force.vector);
  });

  Test.assert.equalArray(system.accumulatedForces, accumulated,
    'Should be directly applied to all particles.');
});
