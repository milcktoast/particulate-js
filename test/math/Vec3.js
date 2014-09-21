module('Vec3');

var Vec3 = Particulate.Vec3;
var slice = Array.prototype.slice;

test('Setting a vector of a float buffer', function () {
  var buffer = new Float32Array(9);
  var v0 = [1, 2, 3];
  var v1 = [4, 5, 6];
  var v2 = [7, 8, 9];

  Vec3.set(buffer, 0, v0);
  Vec3.set(buffer, 1, v1);
  Vec3.set(buffer, 2, v2[0], v2[1], v2[2]);

  Test.assert.equalArray(slice.call(buffer, 0, 3), v0, 'Should set first vec3 from vec3.');
  Test.assert.equalArray(slice.call(buffer, 3, 6), v1, 'Should set second vec3 from vec3.');
  Test.assert.equalArray(slice.call(buffer, 6, 9), v2, 'Should set third vec3 from floats.');
});

test('Getting a vector from a float buffer', function () {
  var v0 = [0, 1, 2];
  var v1 = [3, 4, 5];
  var buffer = new Float32Array([].concat(v0, v1));

  var b0 = Vec3.copy(buffer, 0, Vec3.create());
  var b1 = Vec3.copy(buffer, 1, Vec3.create());

  Test.assert.equalArray(b0, v0, 'Should get first vec3.');
  Test.assert.equalArray(b1, v1, 'Should get second vec3.');
});
