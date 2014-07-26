require('./Constraint');
lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  this._indices = new Uint16Array(2 * 3);
  this.setDistance(distance);
  this.setIndices(a, b);
}

DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);
DistanceConstraint.prototype.setIndices = lib.Constraint.setIndices(3);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

DistanceConstraint.prototype.applyConstraint = function (p0) {
  var ii = this._indices;
  var ax = ii[0], ay = ii[1], az = ii[2];
  var bx = ii[3], by = ii[4], bz = ii[5];

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  if (!(dx && dy && dz)) {
    dx = dy = dz = 0.1;
  }

  var dist2 = this._distance2;
  var len2 = dx * dx + dy * dy + dz * dz;
  var diff = dist2 / (len2 + dist2) - 0.5;

  dx *= diff;
  dy *= diff;
  dz *= diff;

  p0[ax] -= dx;
  p0[ay] -= dy;
  p0[az] -= dz;

  p0[bx] += dx;
  p0[by] += dy;
  p0[bz] += dz;
};
