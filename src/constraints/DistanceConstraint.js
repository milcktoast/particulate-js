require('./Constraint');
lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  this.setDistance(distance);
  this.setLink(a, b);
}

DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

DistanceConstraint.prototype.setLink = function (a, b) {
  this._a = a * 3;
  if (b != null) { this._b = b * 3; }
};

DistanceConstraint.prototype.applyConstraint = function (positions) {
  var ax = this._a;
  var ay = ax + 1;
  var az = ax + 2;

  var bx = this._b;
  var by = bx + 1;
  var bz = bx + 2;

  var dx = positions[bx] - positions[ax];
  var dy = positions[by] - positions[ay];
  var dz = positions[bz] - positions[az];

  var dist2 = this._distance2;
  var dot = dx * dx + dy * dy + dz * dz;
  var diff = dist2 / (dot + dist2) - 0.5;

  dx *= diff;
  dy *= diff;
  dz *= diff;

  positions[ax] -= dx;
  positions[ay] -= dy;
  positions[az] -= dz;

  positions[bx] += dx;
  positions[by] += dy;
  positions[bz] += dz;
};
