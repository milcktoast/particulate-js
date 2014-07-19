lib.ParticleSystem = ParticleSystem;
function ParticleSystem(particles, iterations) {
  var isCount = typeof particles === 'number';
  var length = isCount ? particles * 3 : particles.length;
  var positions = isCount ? length : particles;

  this.positions = new Float32Array(positions);
  this.positionsPrev = new Float32Array(positions);
  this.accumulatedForces = new Float32Array(length);
  this.constraintIterations = iterations || 1;

  this._count = length / 3;
  this._globalConstraints = [];
  this._localConstraints = [];
  this._forces = [];
}

ParticleSystem.prototype.setPosition = function (i, x, y, z) {
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var ix = i * 3;
  var iy = ix + 1;
  var iz = ix + 2;

  p0[ix] = p1[ix] = x;
  p0[iy] = p1[iy] = y;
  p0[iz] = p1[iz] = z;
};

ParticleSystem.prototype.each = function (iterator) {
  for (var i = 0, il = this._count; i < il; i ++) {
    iterator.call(this, i);
  }
};

// Verlet integration
// ------------------

function ps_integrateParticle(i, p0, p1, f0, d2) {
  var pt = p0[i];
  p0[i] += pt - p1[i] + f0[i] * d2;
  p1[i] = pt;
}

ParticleSystem.prototype.integrate = function (delta) {
  var d2 = delta * delta;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var f0 = this.accumulatedForces;

  for (var i = 0, il = this._count * 3; i < il; i += 3) {
    ps_integrateParticle(i,     p0, p1, f0, d2);
    ps_integrateParticle(i + 1, p0, p1, f0, d2);
    ps_integrateParticle(i + 2, p0, p1, f0, d2);
  }
};

// Constraints
// -----------

ParticleSystem.prototype.addConstraint = function (constraint) {
  if (constraint._isGlobal) {
    this._globalConstraints.push(constraint);
  } else {
    this._localConstraints.push(constraint);
  }
};

ParticleSystem.prototype.satisfyConstraints = function () {
  var iterations = this.constraintIterations;
  var global = this._globalConstraints;
  var local = this._localConstraints;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var i, il, j, jl, k;

  for (k = 0; k < iterations; k ++) {
    // Global
    for (i = 0, il = this._count * 3; i < il; i += 3) {
      for (j = 0, jl = global.length; j < jl; j ++) {
        global[j].applyConstraint(i, p0, p1);
      }
    }

    // Local
    for (i = 0, il = local.length; i < il; i ++) {
      local[i].applyConstraint(p0, p1);
    }
  }
};

// Forces
// ------

ParticleSystem.prototype.addForce = function (force) {
  this._forces.push(force);
};

ParticleSystem.prototype.accumulateForces = function (delta) {
  var forces = this._forces;
  var f0 = this.accumulatedForces;
  var p0 = this.positions;
  var p1 = this.positionsPrev;

  for (var i = 0, il = this._count * 3; i < il; i += 3) {
    f0[i] = f0[i + 1] = f0[i + 2] = 0;

    for (var j = 0, jl = forces.length; j < jl; j ++) {
      forces[j].applyForce(i, f0, p0, p1);
    }
  }
};

ParticleSystem.prototype.tick = function (delta) {
  this.accumulateForces(delta);
  this.integrate(delta);
  this.satisfyConstraints();
};
