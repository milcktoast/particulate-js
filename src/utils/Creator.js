/**
  @module utils
  @class Particulate
*/

/**
  Functional constructor utility.

  @method ctor
  @param  {Function} Ctor         Constructor function used to instantiate class
  @return {Function} constructor
  @private
  @static
*/
export function ctor(Ctor) {
  return function () {
    var instance = Object.create(Ctor.prototype)
    Ctor.apply(instance, arguments)
    return instance
  }
}

/**
  Functional inheritance utility

  @method inherit
  @param {Function} Ctor        Class constructor
  @param {Function} ParentCtor  Parent class constructor
  @private
  @static
*/
export function inherit(Ctor, ParentCtor) {
  Ctor.create = ctor(Ctor)
  Ctor.prototype = Object.create(ParentCtor.prototype)
  Ctor.prototype.constructor = Ctor
}
