lib.ParticleSystem = ParticleSystem;
function ParticleSystem(count, iterations) {
  this.positions = new Float32Array(count * 3);
  this.positionsPrev = new Float32Array(count * 3);
  this.accumulatedForces = new Float32Array(count * 3);
  this.constraintIterations = iterations || 1;

  this._count = count;
  this._globalConstraints = [];
  this._localConstraints = [];
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
  var i, il, j, jl, k;

  for (k = 0; k < iterations; k ++) {
    // Global
    for (i = 0, il = this._count * 3; i < il; i += 3) {
      for (j = 0, jl = global.length; j < jl; j ++) {
        global[j].applyConstraint(i, p0);
      }
    }

    // Local
    for (i = 0, il = local.length; i < il; i ++) {
      local[i].applyConstraint(p0);
    }
  }
};

ParticleSystem.prototype.accumulateForces = function (delta) {
  var f0 = this.accumulatedForces;

  for (var i = 0, j = 0, il = this._count * 3; i < il; i += 3) {
    f0[i]     = 0;
    f0[i + 1] = -0.05;
    f0[i + 2] = 0.0;
  }
};

ParticleSystem.prototype.tick = function (delta) {
  this.accumulateForces(delta);
  this.integrate(delta);
  this.satisfyConstraints();
};
