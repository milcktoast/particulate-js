lib.Constraint = Constraint;
function Constraint() {}

Constraint.prototype.setParticleIndex = function (index) {
  this._isGlobal = index == null;
  if (!this._isGlobal) { this._particleIndex = index; }
};
