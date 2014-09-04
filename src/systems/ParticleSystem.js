lib.ParticleSystem = ParticleSystem;
function ParticleSystem(particles, iterations) {
  var isCount = typeof particles === 'number';
  var length = isCount ? particles * 3 : particles.length;
  var count = length / 3;
  var positions = isCount ? length : particles;

  this.positions = new Float32Array(positions);
  this.positionsPrev = new Float32Array(positions);
  this.accumulatedForces = new Float32Array(length);

  this.weights = new Float32Array(count);
  this.setWeights(1);

  this._iterations = iterations || 1;
  this._count = count;
  this._globalConstraints = [];
  this._localConstraints = [];
  this._pinConstraints = [];
  this._forces = [];
}

ParticleSystem.create = lib.ctor(ParticleSystem);

ParticleSystem.prototype.setPosition = function (i, x, y, z) {
  lib.Vec3.set(this.positions, i, x, y, z);
  lib.Vec3.set(this.positionsPrev, i, x, y, z);
};

ParticleSystem.prototype.getPosition = function (i, out) {
  return lib.Vec3.get(this.positions, i, out);
};

ParticleSystem.prototype.getDistance = function (a, b) {
  return lib.Vec3.distance(this.positions, a, b);
};

ParticleSystem.prototype.getAngle = function (a, b, c) {
  return lib.Vec3.angle(this.positions, a, b, c);
};

ParticleSystem.prototype.setWeight = function (i, w) {
  this.weights[i] = w;
};

ParticleSystem.prototype.setWeights = function (w) {
  var weights = this.weights;
  for (var i = 0, il = weights.length; i < il; i ++) {
    weights[i] = w;
  }
};

ParticleSystem.prototype.each = function (iterator, context) {
  context = context || this;
  for (var i = 0, il = this._count; i < il; i ++) {
    iterator.call(context, i, this);
  }
};

ParticleSystem.prototype.perturb = function (scale) {
  var positions = this.positions;
  var positionsPrev = this.positionsPrev;
  var dist;

  for (var i = 0, il = positions.length; i < il; i ++) {
    dist = Math.random() * scale;
    positions[i] += dist;
    positionsPrev[i] += dist;
  }
};

// Verlet integration
// ------------------

function ps_integrateParticle(i, p0, p1, f0, weight, d2) {
  var pt = p0[i];
  p0[i] += pt - p1[i] + f0[i] * weight * d2;
  p1[i] = pt;
}

ParticleSystem.prototype.integrate = function (delta) {
  var d2 = delta * delta;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var f0 = this.accumulatedForces;
  var w0 = this.weights;
  var ix, weight;

  for (var i = 0, il = this._count; i < il; i ++) {
    weight = w0[i];
    ix = i * 3;

    ps_integrateParticle(ix,     p0, p1, f0, weight, d2);
    ps_integrateParticle(ix + 1, p0, p1, f0, weight, d2);
    ps_integrateParticle(ix + 2, p0, p1, f0, weight, d2);
  }
};

// Constraints
// -----------

ParticleSystem.prototype._getConstraintBuffer = function (constraint) {
  return constraint._isGlobal ? this._globalConstraints : this._localConstraints;
};

ParticleSystem.prototype.addConstraint = function (constraint) {
  this._getConstraintBuffer(constraint).push(constraint);
};

ParticleSystem.prototype.removeConstraint = function (constraint) {
  lib.Collection.removeAll(this._getConstraintBuffer(constraint), constraint);
};

ParticleSystem.prototype.addPinConstraint = function (constraint) {
  this._pinConstraints.push(constraint);
};

ParticleSystem.prototype.removePinConstraint = function (constraint) {
  lib.Collection.removeAll(this._pinConstraints, constraint);
};

ParticleSystem.prototype.satisfyConstraints = function () {
  var iterations = this._iterations;
  var global = this._globalConstraints;
  var local = this._localConstraints;
  var pins = this._pinConstraints;
  var globalCount = this._count;
  var globalItemSize = 3;

  for (var i = 0; i < iterations; i ++) {
    this.satisfyConstraintGroup(global, globalCount, globalItemSize);
    this.satisfyConstraintGroup(local);

    if (!pins.length) { continue; }
    this.satisfyConstraintGroup(pins);
  }
};

ParticleSystem.prototype.satisfyConstraintGroup = function (group, count, itemSize) {
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var hasUniqueCount = !count;
  var constraint;

  for (var i = 0, il = group.length; i < il; i ++) {
    constraint = group[i];

    if (hasUniqueCount) {
      count = constraint._count || 1;
      itemSize = constraint._itemSize;
    }

    for (var j = 0; j < count; j ++) {
      constraint.applyConstraint(j * itemSize, p0, p1);
    }
  }
};

// Forces
// ------

ParticleSystem.prototype.addForce = function (force) {
  this._forces.push(force);
};

ParticleSystem.prototype.removeForce = function (force) {
  lib.Collection.removeAll(this._forces, force);
};

ParticleSystem.prototype.accumulateForces = function (delta) {
  var forces = this._forces;
  var f0 = this.accumulatedForces;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var ix;

  for (var i = 0, il = this._count; i < il; i ++) {
    ix = i * 3;
    f0[ix] = f0[ix + 1] = f0[ix + 2] = 0;

    for (var j = 0, jl = forces.length; j < jl; j ++) {
      forces[j].applyForce(ix, f0, p0, p1);
    }
  }
};

ParticleSystem.prototype.tick = function (delta) {
  this.accumulateForces(delta);
  this.integrate(delta);
  this.satisfyConstraints();
};
