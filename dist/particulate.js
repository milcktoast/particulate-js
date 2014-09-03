// Particulate.js 0.2.0
// ====================

(function () {
  var lib = {VERSION : '0.2.0'};


var Collection = lib.Collection = {};

Collection.removeAll = function (buffer, item) {
  var index = buffer.indexOf(item);
  if (index < 0) { return; }

  for (var i = buffer.length - 1; i >= index; i --) {
    if (buffer[i] === item) {
      buffer.splice(i, 1);
    }
  }
};


lib.ctor = function ctor(Ctor) {
  return function () {
    var instance = Object.create(Ctor.prototype);
    Ctor.apply(instance, arguments);
    return instance;
  };
};


lib.Math = {};

lib.Math.clamp = function (min, max, v) {
  return Math.min(Math.max(v, min), max);
};


var Vec3 = lib.Vec3 = {};

Vec3.create = function () {
  return new Float32Array(3);
};

Vec3.set = function (b0, i, x, y, z) {
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

Vec3.get = function (b0, i, out) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2;

  out[0] = b0[ix];
  out[1] = b0[iy];
  out[2] = b0[iz];

  return out;
};

Vec3.lengthSq = function (b0, ai) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var x = b0[aix];
  var y = b0[aiy];
  var z = b0[aiz];

  return x * x + y * y + z * z;
};

Vec3.length = function (b0, ai) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var x = b0[aix];
  var y = b0[aiy];
  var z = b0[aiz];

  return Math.sqrt(x * x + y * y + z * z);
};

Vec3.distanceSq = function (b0, ai, bi) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;

  var dx = b0[aix] - b0[bix];
  var dy = b0[aiy] - b0[biy];
  var dz = b0[aiz] - b0[biz];

  return dx * dx + dy * dy + dz * dz;
};

Vec3.distance = function (b0, ai, bi) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;

  var dx = b0[aix] - b0[bix];
  var dy = b0[aiy] - b0[biy];
  var dz = b0[aiz] - b0[biz];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

Vec3.angle = function (b0, ai, bi, ci) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  var baLen = 1 / Vec3.distance(b0, bi, ai);
  var bcLen = 1 / Vec3.distance(b0, bi, ci);

  var baX = (b0[aix] - b0[bix]) * baLen;
  var baY = (b0[aiy] - b0[biy]) * baLen;
  var baZ = (b0[aiz] - b0[biz]) * baLen;

  var bcX = (b0[cix] - b0[bix]) * bcLen;
  var bcY = (b0[ciy] - b0[biy]) * bcLen;
  var bcZ = (b0[ciz] - b0[biz]) * bcLen;

  var dot = baX * bcX + baY * bcY + baZ * bcZ;

  return Math.acos(dot);
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

Force.create = lib.ctor(Force);

Force.prototype.set = function (x, y, z) {
  lib.Vec3.set(this.vector, 0, x, y, z);
};


lib.DirectionalForce = DirectionalForce;
function DirectionalForce(vector) {
  lib.Force.call(this, vector);
}

DirectionalForce.create = lib.ctor(DirectionalForce);
DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (ix, f0, p0, p1) {
  var v0 = this.vector;
  f0[ix]     += v0[0];
  f0[ix + 1] += v0[1];
  f0[ix + 2] += v0[2];
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

PointForce.create = lib.ctor(PointForce);
PointForce.prototype = Object.create(lib.Force.prototype);

PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointForce.prototype.applyForce = function (ix, f0, p0, p1) {
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
    scale = diff / dist * this.intensity;

    f0[ix] -= dx * scale;
    f0[iy] -= dy * scale;
    f0[iz] -= dz * scale;
  }
};


lib.Constraint = Constraint;
function Constraint(size, itemSize) {
  this.indices = new Uint16Array(size || 2);
  this._count = size / itemSize;
  this._itemSize = itemSize;
}

Constraint.create = lib.ctor(Constraint);

Constraint.prototype.setIndices = function (indices) {
  var inx = indices.length ? indices : arguments;
  var ii = this.indices;

  for (var i = 0; i < inx.length; i ++) {
    ii[i] = inx[i];
  }
};


lib.AngleConstraint = AngleConstraint;
function AngleConstraint(angle, a, b, c) {
  var size = a.length || arguments.length - 1;
  var min = angle.length ? angle[0] : angle;
  var max = angle.length ? angle[1] : angle;

  lib.Constraint.call(this, size, 3);
  this.setAngle(min, max);
  this.setIndices(a, b, c);
}

AngleConstraint.create = lib.ctor(AngleConstraint);
AngleConstraint.prototype = Object.create(lib.Constraint.prototype);

AngleConstraint.prototype.setAngle = function (min, max) {
  max = max != null ? max : min;
  this.setMin(min);
  this.setMax(max);
};

AngleConstraint.prototype.setMin = function (min) {
  this._min = this.clampAngle(min);
};

AngleConstraint.prototype.setMax = function (max) {
  this._max = this.clampAngle(max);
};

AngleConstraint.prototype.clampAngle = function (angle) {
  var p = 0.0000001;
  return lib.Math.clamp(p, Math.PI - p, angle);
};

AngleConstraint.ANGLE_OBTUSE = Math.PI * 0.75;

// TODO: Optimize, reduce usage of Math.sqrt
AngleConstraint.prototype.applyConstraint = function (index, p0, p1) {
  /*jshint maxcomplexity:15*/

  var ii = this.indices;
  var ai = ii[index], bi = ii[index + 1], ci = ii[index + 2];

  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2;
  var bix = bi * 3, biy = bix + 1, biz = bix + 2;
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2;

  // AB (A -> B)
  var abX = p0[bix] - p0[aix];
  var abY = p0[biy] - p0[aiy];
  var abZ = p0[biz] - p0[aiz];

  // BC (B -> C)
  var bcX = p0[cix] - p0[bix];
  var bcY = p0[ciy] - p0[biy];
  var bcZ = p0[ciz] - p0[biz];

  // AC (A -> C)
  var acX = p0[cix] - p0[aix];
  var acY = p0[ciy] - p0[aiy];
  var acZ = p0[ciz] - p0[aiz];

  // Perturb coincident particles
  if (!(acX || acY || acZ)) {
    p0[aix] += 0.1;
    p0[biy] += 0.1;
    p0[cix] -= 0.1;
    return;
  }

  var abLenSq = abX * abX + abY * abY + abZ * abZ;
  var bcLenSq = bcX * bcX + bcY * bcY + bcZ * bcZ;
  var acLenSq = acX * acX + acY * acY + acZ * acZ;

  var abLen = Math.sqrt(abLenSq);
  var bcLen = Math.sqrt(bcLenSq);
  var acLen = Math.sqrt(acLenSq);

  var abLenInv = 1 / abLen;
  var bcLenInv = 1 / bcLen;

  var minAngle = this._min;
  var maxAngle = this._max;
  var bAngle = Math.acos(
    -abX * abLenInv * bcX * bcLenInv +
    -abY * abLenInv * bcY * bcLenInv +
    -abZ * abLenInv * bcZ * bcLenInv);

  if (bAngle > minAngle && bAngle < maxAngle) { return; }
  var bAngleTarget = bAngle < minAngle ? minAngle : maxAngle;

  // Target length for AC
  var acLenTargetSq = abLenSq + bcLenSq - 2 * abLen * bcLen * Math.cos(bAngleTarget);
  var acLenTarget = Math.sqrt(acLenTargetSq);
  var acDiff = (acLen - acLenTarget) / acLen * 0.5;

  p0[aix] += acX * acDiff;
  p0[aiy] += acY * acDiff;
  p0[aiz] += acZ * acDiff;

  p0[cix] -= acX * acDiff;
  p0[ciy] -= acY * acDiff;
  p0[ciz] -= acZ * acDiff;

  // Only manipulate particle B for obtuse targets
  if (bAngleTarget < AngleConstraint.ANGLE_OBTUSE) { return; }

  // Target angle for A
  var aAngleTarget = Math.acos((abLenSq + acLenTargetSq - bcLenSq) / (2 * abLen * acLenTarget));

  // Unit vector AC
  var acLenInv = 1 / acLen;
  var acuX = acX * acLenInv;
  var acuY = acY * acLenInv;
  var acuZ = acZ * acLenInv;

  // Project B onto AC as vector AP
  var pt = acuX * abX + acuY * abY + acuZ * abZ;
  var apX = acuX * pt;
  var apY = acuY * pt;
  var apZ = acuZ * pt;

  // BP (B -> P)
  var bpX = apX - abX;
  var bpY = apY - abY;
  var bpZ = apZ - abZ;

  // B is inline with AC
  if (!(bpX || bpY || bpZ)) {
    if (bAngleTarget < Math.PI) {
      p0[bix] += 0.1;
      p0[biy] += 0.1;
      p0[biz] += 0.1;
    }
    return;
  }

  var apLenSq = apX * apX + apY * apY + apZ * apZ;
  var bpLenSq = bpX * bpX + bpY * bpY + bpZ * bpZ;
  var apLen = Math.sqrt(apLenSq);
  var bpLen = Math.sqrt(bpLenSq);

  var bpLenTarget = apLen * Math.tan(aAngleTarget);
  var bpDiff = (bpLen - bpLenTarget) / bpLen;

  p0[bix] += bpX * bpDiff;
  p0[biy] += bpY * bpDiff;
  p0[biz] += bpZ * bpDiff;
};


lib.BoxConstraint = BoxConstraint;
function BoxConstraint(min, max) {
  this._isGlobal = true;
  this.bounds = new Float32Array(6);
  this.friction = 0.05;

  this.setBounds(min, max);
}

BoxConstraint.create = lib.ctor(BoxConstraint);
BoxConstraint.prototype = Object.create(lib.Constraint.prototype);

BoxConstraint.prototype.setBounds = function (min, max) {
  this.setMin(min);
  this.setMax(max);
};

BoxConstraint.prototype.setMin = function (x, y, z) {
  lib.Vec3.set(this.bounds, 0, x, y, z);
};

BoxConstraint.prototype.setMax = function (x, y, z) {
  lib.Vec3.set(this.bounds, 1, x, y, z);
};

BoxConstraint.prototype.applyConstraint = function (ix, p0, p1) {
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
  var size = a.length || arguments.length - 1;
  var min = distance.length ? distance[0] : distance;
  var max = distance.length ? distance[1] : distance;

  lib.Constraint.call(this, size, 2);
  this.setDistance(min, max);
  this.setIndices(a, b);
}

DistanceConstraint.create = lib.ctor(DistanceConstraint);
DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);

DistanceConstraint.prototype.setDistance = function (min, max) {
  var min2 = min * min;
  var max2 = max != null ? max * max : min2;
  this._min2 = min2;
  this._max2 = max2;
};

DistanceConstraint.prototype.setMin = function (min) {
  this._min2 = min * min;
};

DistanceConstraint.prototype.setMax = function (max) {
  this._max2 = max * max;
};

DistanceConstraint.prototype.applyConstraint = function (index, p0, p1) {
  var ii = this.indices;
  var ai = ii[index], bi = ii[index + 1];

  var ax = ai * 3, ay = ax + 1, az = ax + 2;
  var bx = bi * 3, by = bx + 1, bz = bx + 2;

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  if (!(dx || dy || dz)) {
    dx = dy = dz = 0.1;
  }

  var dist2 = dx * dx + dy * dy + dz * dz;
  var min2 = this._min2;
  var max2 = this._max2;

  if (dist2 < max2 && dist2 > min2) { return; }

  var target2 = dist2 < min2 ? min2 : max2;
  var diff = target2 / (dist2 + target2);
  var aDiff = diff - 0.5;
  var bDiff = diff - 0.5;

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
  this._count = 1;
}

PointConstraint.create = lib.ctor(PointConstraint);
PointConstraint.prototype = Object.create(lib.Constraint.prototype);

PointConstraint.prototype.setPosition = function (x, y, z) {
  lib.Vec3.set(this.position, 0, x, y, z);
};

PointConstraint.prototype.applyConstraint = function (index, p0, p1) {
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
  var globalCount = this._count * 3;
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


  this.Particulate = lib;
}).call(this);
