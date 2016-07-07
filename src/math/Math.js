/**
  @module math
  @main math
*/

/**
  Math utilities.

  @class Math
  @static
*/

/**
  Clamp value to `[min, max]` range.

  @method clamp
  @static
  @param  {Float} min
  @param  {Float} max
  @param  {Float} v    Value to clamp
  @return {Float} Clamped value
*/
export function clamp (min, max, v) {
  return Math.min(Math.max(v, min), max)
}
