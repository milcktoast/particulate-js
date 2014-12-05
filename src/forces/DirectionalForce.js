require('./Force');

// ..................................................
// DirectionalForce
// ..................................................

lib.DirectionalForce = DirectionalForce;

/**
  @module forces
*/

/**
  Defines a directional force that affects all particles in the system.

  ```javascript
  var gravity = DirectionalForce.create([0.0, -0.1, 0.0]);
  ```

  @class DirectionalForce
  @extends Force
  @constructor
  @param {Array (Vec3)} vector  Direction vector
*/
function DirectionalForce(vector) {
  lib.Force.call(this, vector);
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
DirectionalForce.create = lib.ctor(DirectionalForce);
DirectionalForce.prototype = Object.create(lib.Force.prototype);
DirectionalForce.prototype.constructor = DirectionalForce;

DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1) {
  var v0 = this.vector;
  f0[ix]     += v0[0];
  f0[ix + 1] += v0[1];
  f0[ix + 2] += v0[2];
};
