// Particulate.js 0.1.0
// ====================

(function () {
  var lib = {VERSION : '0.1.0'};


lib.Math = {};

lib.Math.clamp = function (min, max, v) {
  return Math.min(Math.max(v, min), max);
};


lib.Vec3 = {};

lib.Vec3.create = function () {
  return new Float32Array(3);
};

lib.Vec3.set = function (b0, i, x, y, z) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  if (y == null) {
    z = x[2];
    y = x[1];
    x = x[0];
  }

  b0[ix] = x;
  b0[iy] = y;
  b0[iz] = z;
};

lib.Vec3.get = function (b0, i, out) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  out[0] = b0[ix];
  out[1] = b0[iy];
  out[2] = b0[iz];

  return out;
};

lib.Vec3.distance = function (b0, a, b) {
  var ax = a * 3, ay = ax + 1, az = ax + 2;
  var bx = b * 3, by = bx + 1, bz = bx + 2;

  var dx = b0[ax] - b0[bx];
  var dy = b0[ay] - b0[by];
  var dz = b0[az] - b0[bz];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};


lib.Force = Force;
function Force(vector, opts) {
  opts = opts || {};
  this.vector = new Float32Array(3);
  this.type = opts.type || Force.ATTRACTOR;

  if (vector != null) { this.set(vector); }
}

Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;

Force.create = function (vector, opts) {
  return new Force(vector, opts);
};

Force.prototype.set = function (x, y, z) {
  lib.Vec3.set(this.vector, 0, x, y, z);
};


lib.DirectionalForce = DirectionalForce;
function DirectionalForce(vector) {
  lib.Force.call(this, vector);
}

DirectionalForce.create = function (vector) {
  return new DirectionalForce(vector);
};

DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1, weight) {
  var v0 = this.vector;
  f0[ix]     += (v0[0] * weight);
  f0[ix + 1] += (v0[1] * weight);
  f0[ix + 2] += (v0[2] * weight);
};


lib.PointForce = PointForce;
function PointForce(position, opts) {
  opts = opts || {};
  lib.Force.apply(this, arguments);
  this.intensity = opts.intensity || 0.05;
  this.setRadius(opts.radius || 0);
}

var pf_ATTRACTOR = lib.Force.ATTRACTOR;
var pf_REPULSOR = lib.Force.REPULSOR;
var pf_ATTRACTOR_REPULSOR = lib.Force.ATTRACTOR_REPULSOR;

PointForce.create = function (position, opts) {
  return new PointForce(position, opts);
};

PointForce.prototype = Object.create(lib.Force.prototype);

PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointForce.prototype.applyForce = function (ix, f0, p0, p1, weight) {
  var v0 = this.vector;
  var iy = ix + 1;
  var iz = ix + 2;

  var dx = p0[ix] - v0[0];
  var dy = p0[iy] - v0[1];
  var dz = p0[iz] - v0[2];

  var dist = dx * dx + dy * dy + dz * dz;
  var diff = dist - this._radius2;
  var isActive, scale;

  switch (this.type) {
  case pf_ATTRACTOR:
    isActive = dist > 0 && diff > 0;
    break;
  case pf_REPULSOR:
    isActive = dist > 0 && diff < 0;
    break;
  case pf_ATTRACTOR_REPULSOR:
    isActive = dx || dy || dz;
    break;
  }

  if (isActive) {
    scale = diff / dist * (this.intensity * weight);

    f0[ix] -= dx * scale;
    f0[iy] -= dy * scale;
    f0[iz] -= dz * scale;
  }
};


lib.Constraint = Constraint;
function Constraint(size) {
  this.indices = new Uint16Array(size || 2);
}

Constraint.create = function (size) {
  return new Constraint(size);
};

Constraint.prototype.setIndices = function (indices) {
  var inx = indices.length ? indices : arguments;
  var ii = this.indices;

  for (var i = 0; i < inx.length; i ++) {
    ii[i] = inx[i];
  }
};


lib.BoxConstraint = BoxConstraint;
function BoxConstraint(min, max) {
  this._isGlobal = true;
  this.bounds = new Float32Array(6);
  this.friction = 0.05;

  if (min) { this.setMin(min); }
  if (max) { this.setMax(max); }
}

BoxConstraint.create = function (min, max) {
  return new BoxConstraint(min, max);
};

BoxConstraint.prototype = Object.create(lib.Constraint.prototype);

BoxConstraint.prototype.setMin = function (x, y, z) {
  lib.Vec3.set(this.bounds, 0, x, y, z);
};

BoxConstraint.prototype.setMax = function (x, y, z) {
  lib.Vec3.set(this.bounds, 1, x, y, z);
};

BoxConstraint.prototype.applyConstraint = function (ix, p0, p1, w0) {
  var friction = this.friction;
  var b = this.bounds;
  var iy = ix + 1;
  var iz = ix + 2;

  var px = lib.Math.clamp(b[0], b[3], p0[ix]);
  var py = lib.Math.clamp(b[1], b[4], p0[iy]);
  var pz = lib.Math.clamp(b[2], b[5], p0[iz]);

  var dx = p0[ix] - px;
  var dy = p0[iy] - py;
  var dz = p0[iz] - pz;

  p0[ix] = px;
  p0[iy] = py;
  p0[iz] = pz;

  if (dx || dy || dz) {
    p1[ix] -= (p1[ix] - px) * friction;
    p1[iy] -= (p1[iy] - py) * friction;
    p1[iz] -= (p1[iz] - pz) * friction;
  }
};


lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  lib.Constraint.call(this, 2);
  this.setDistance(distance);
  this.setIndices(a, b);
}

DistanceConstraint.create = function (distance, a, b) {
  return new DistanceConstraint(distance, a, b);
};

DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

DistanceConstraint.prototype.applyConstraint = function (p0, p1, w0) {
  var ii = this.indices;
  var ai = ii[0], bi = ii[1];
  var ax = ai * 3, ay = ax + 1, az = ax + 2;
  var bx = bi * 3, by = bx + 1, bz = bx + 2;

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  if (!(dx || dy || dz)) {
    dx = dy = dz = 0.1;
  }

  var aw = w0[ai];
  var bw = w0[bi];
  var tw = aw + bw;

  var dist2 = this._distance2;
  var len2 = dx * dx + dy * dy + dz * dz;
  var diff = dist2 / (len2 + dist2);

  var aDiff = diff - aw / tw;
  var bDiff = diff - bw / tw;

  p0[ax] -= dx * aDiff;
  p0[ay] -= dy * aDiff;
  p0[az] -= dz * aDiff;

  p0[bx] += dx * bDiff;
  p0[by] += dy * bDiff;
  p0[bz] += dz * bDiff;
};


lib.PointConstraint = PointConstraint;
function PointConstraint(position, index) {
  this.position = new Float32Array(position);
  this.index = index;
}

PointConstraint.create = function (position, index) {
  return new PointConstraint(position, index);
};

PointConstraint.prototype = Object.create(lib.Constraint.prototype);

PointConstraint.prototype.setPosition = function (x, y, z) {
  lib.Vec3.set(this.position, 0, x, y, z);
};

PointConstraint.prototype.applyConstraint = function (p0, p1, w0) {
  var i = this.index;
  var ix = i * 3, iy = ix + 1, iz = ix + 2;
  var p = this.position;

  p0[ix] = p1[ix] = p[0];
  p0[iy] = p1[iy] = p[1];
  p0[iz] = p1[iz] = p[2];
};


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

ParticleSystem.create = function (particles, iterations) {
  return new ParticleSystem(particles, iterations);
};

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

ParticleSystem.prototype.setWeight = function (i, w) {
  this.weights[i] = w;
};

ParticleSystem.prototype.setWeights = function (w) {
  var weights = this.weights;
  for (var i = 0, il = weights.length; i < il; i ++) {
    weights[i] = w;
  }
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

ParticleSystem.prototype._getConstraintBuffer = function (constraint) {
  return constraint._isGlobal ? this._globalConstraints : this._localConstraints;
};

ParticleSystem.prototype.addConstraint = function (constraint) {
  var buffer = this._getConstraintBuffer(constraint);
  var index = buffer.indexOf(constraint);
  if (index < 0) {
    buffer.push(constraint);
  }
};

ParticleSystem.prototype.removeConstraint = function (constraint) {
  var buffer = this._getConstraintBuffer(constraint);
  var index = buffer.indexOf(constraint);
  if (index >= 0) {
    buffer.splice(index, 1);
  }
};

ParticleSystem.prototype.addPinConstraint = function (constraint) {
  var buffer = this._pinConstraints;
  var index = buffer.indexOf(constraint);
  if (index < 0) {
    buffer.push(constraint);
  }
};

ParticleSystem.prototype.removePinConstraint = function (constraint) {
  var buffer = this._pinConstraints;
  var index = buffer.indexOf(constraint);
  if (index >= 0) {
    buffer.splice(index, 1);
  }
};

ParticleSystem.prototype.satisfyConstraints = function () {
  var iterations = this._iterations;
  var global = this._globalConstraints;
  var local = this._localConstraints;
  var pins = this._pinConstraints;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var w0 = this.weights;
  var i, il, j, jl, k;

  for (k = 0; k < iterations; k ++) {
    // Global
    for (i = 0, il = this._count * 3; i < il; i += 3) {
      for (j = 0, jl = global.length; j < jl; j ++) {
        global[j].applyConstraint(i, p0, p1, w0);
      }
    }

    // Local
    for (i = 0, il = local.length; i < il; i ++) {
      local[i].applyConstraint(p0, p1, w0);
    }

    // Pins
    if (!pins.length) { continue; }
    for (i = 0, il = pins.length; i < il; i ++) {
      pins[i].applyConstraint(p0, p1, w0);
    }
  }
};

// Forces
// ------

ParticleSystem.prototype.addForce = function (force) {
  var buffer = this._forces;
  var index = buffer.indexOf(force);
  if (index < 0) {
    buffer.push(force);
  }
};

ParticleSystem.prototype.removeForce = function (force) {
  var buffer = this._forces;
  var index = buffer.indexOf(force);
  if (index >= 0) {
    buffer.splice(index, 1);
  }
};

ParticleSystem.prototype.accumulateForces = function (delta) {
  var forces = this._forces;
  var f0 = this.accumulatedForces;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var w0 = this.weights;
  var ix, w;

  for (var i = 0, il = this._count; i < il; i ++) {
    ix = i * 3;
    w = w0[i];
    f0[ix] = f0[ix + 1] = f0[ix + 2] = 0;

    for (var j = 0, jl = forces.length; j < jl; j ++) {
      forces[j].applyForce(ix, f0, p0, p1, w);
    }
  }
};

ParticleSystem.prototype.tick = function (delta) {
  this.accumulateForces(delta);
  this.integrate(delta);
  this.satisfyConstraints();
};


  this.Particulate = lib;
}).call(this);
