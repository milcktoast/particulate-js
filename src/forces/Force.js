// ..................................................
// Force
// ..................................................

lib.Force = Force;

/**
  Forces are accumulated and applied to particles, affecting their
  acceleration and velocity in the system's integration step.

  @module forces
  @main forces
*/

/**
  Base class for defining forces.

  @class Force
  @constructor
  @param {Array (Vec3)}  vector
  @param {Object}       [opts]       Options
  @param {Int (Enum)}   [opts.type]
*/
function Force(vector, opts) {
  opts = opts || {};
  this.vector = new Float32Array(3);

  if (opts.type) { this.type = opts.type; }
  if (vector != null) { this.set(vector); }
}

/**
  Create instance, accepts constructor arguments.

  @method create
  @static
*/
Force.create = lib.ctor(Force);

/**
  Force type enum: `Force.ATTRACTOR`, `Force.REPULSOR`, `Force.ATTRACTOR_REPULSOR`.

  @property type
  @type {Int (Enum)}
  @default Force.ATTRACTOR
*/
Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;
Force.prototype.type = Force.ATTRACTOR;

/**
  Alias for `Vec3.set`.

  @method set
  @param {Float} x
  @param {Float} y
  @param {Float} z
*/
Force.prototype.set = function (x, y, z) {
  lib.Vec3.set(this.vector, 0, x, y, z);
};

/**
  Apply force to one particle in system.

  @method applyForce
  @param {Int}                 ix  Particle vector `x` index
  @param {Float32Array (Vec3)} f0  Reference to `ParticleSystem.accumulatedForces`
  @param {Float32Array (Vec3)} p0  Reference to `ParticleSystem.positions`
  @param {Float32Array (Vec3)} p1  Reference to `ParticleSystem.positionsPrev`
  @protected
*/
DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1) {};
