// ..................................................
// Vec3
// ..................................................

var Vec3 = {}
export { Vec3 }

/**
  @module math
*/

/**
  Vector utilities.

  @class Vec3
  @static
*/

/**
  @method create
  @static
  @param  {Int|Array}    positions  Number of vectors or array of initial values
  @return {Float32Array} Vec3 buffer
*/
Vec3.create = function (positions) {
  positions = positions || 1
  var isCount = typeof positions === 'number'
  return new Float32Array(isCount ? positions * 3 : positions)
}

/**
  Set single vector in buffer

  @method set
  @static
  @param {Array}        b0  Vec3 buffer
  @param {Int}          i   Vector index
  @param {Array|Float}  x   Vector or x component value
  @param {Float}       [y]
  @param {Float}       [z]
*/
Vec3.set = function (b0, i, x, y, z) {
  var ix = i * 3, iy = ix + 1, iz = ix + 2

  if (y == null) {
    z = x[2]
    y = x[1]
    x = x[0]
  }

  b0[ix] = x
  b0[iy] = y
  b0[iz] = z
}

/**
  @method copy
  @static
  @param {Array} b0   Vec3 buffer
  @param {Int}   ai   Vector index
  @param {Array} out  Destination vector
*/
Vec3.copy = function (b0, ai, out) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2

  out[0] = b0[aix]
  out[1] = b0[aiy]
  out[2] = b0[aiz]

  return out
}

/**
  @method lengthSq
  @static
  @param  {Array} b0   Vec3 buffer
  @param  {Int}   ai   Vector index
  @return {Float} Squared length of vector
*/
Vec3.lengthSq = function (b0, ai) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var x = b0[aix]
  var y = b0[aiy]
  var z = b0[aiz]

  return x * x + y * y + z * z
}

/**
  @method length
  @static
  @param  {Array} b0   Vec3 buffer
  @param  {Int}   ai   Vector index
  @return {Float} Length of vector
*/
Vec3.length = function (b0, ai) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var x = b0[aix]
  var y = b0[aiy]
  var z = b0[aiz]

  return Math.sqrt(x * x + y * y + z * z)
}

/**
  @method distanceSq
  @static
  @param  {Array} b0   Vec3 buffer
  @param  {Int}   ai   Vector index a
  @param  {Int}   bi   Vector index b
  @return {Float} Squared distance from a to b
*/
Vec3.distanceSq = function (b0, ai, bi) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2

  var dx = b0[aix] - b0[bix]
  var dy = b0[aiy] - b0[biy]
  var dz = b0[aiz] - b0[biz]

  return dx * dx + dy * dy + dz * dz
}

/**
  @method distance
  @static
  @param  {Array} b0   Vec3 buffer
  @param  {Int}   ai   Vector index a
  @param  {Int}   bi   Vector index b
  @return {Float} Distance from a to b
*/
Vec3.distance = function (b0, ai, bi) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2

  var dx = b0[aix] - b0[bix]
  var dy = b0[aiy] - b0[biy]
  var dz = b0[aiz] - b0[biz]

  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
  Normalize vector in place

  @method normalize
  @static
  @param {Array} b0  Vec3 buffer
  @param {Int}   ai  Vector index a
*/
Vec3.normalize = function (b0, ai) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var x = b0[aix]
  var y = b0[aiy]
  var z = b0[aiz]
  var lenInv = 1 / Math.sqrt(x * x + y * y + z * z)

  b0[aix] *= lenInv
  b0[aiy] *= lenInv
  b0[aiz] *= lenInv
}

/**
  Calculate angle between segments `ab` and `bc`

  @method angle
  @static
  @param  {Array} b0   Vec3 buffer
  @param  {Int}   ai   Vector index a
  @param  {Int}   bi   Vector index b
  @param  {Int}   ci   Vector index c
  @return {Float} Angle in radians
*/
Vec3.angle = function (b0, ai, bi, ci) {
  var aix = ai * 3, aiy = aix + 1, aiz = aix + 2
  var bix = bi * 3, biy = bix + 1, biz = bix + 2
  var cix = ci * 3, ciy = cix + 1, ciz = cix + 2

  var baLenInv = 1 / Vec3.distance(b0, bi, ai)
  var bcLenInv = 1 / Vec3.distance(b0, bi, ci)

  var baX = (b0[aix] - b0[bix]) * baLenInv
  var baY = (b0[aiy] - b0[biy]) * baLenInv
  var baZ = (b0[aiz] - b0[biz]) * baLenInv

  var bcX = (b0[cix] - b0[bix]) * bcLenInv
  var bcY = (b0[ciy] - b0[biy]) * bcLenInv
  var bcZ = (b0[ciz] - b0[biz]) * bcLenInv

  var dot = baX * bcX + baY * bcY + baZ * bcZ

  return Math.acos(dot)
}
