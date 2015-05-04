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
lib.ctor = function ctor(Ctor) {
  return function () {
    var instance = Object.create(Ctor.prototype);
    Ctor.apply(instance, arguments);
    return instance;
  };
};

/**
  Functional inheritance utility

  @method inherit
  @param {Function} Ctor        Class constructor
  @param {Function} ParentCtor  Parent class constructor
  @private
  @static
*/
lib.inherit = function inherit(Ctor, ParentCtor) {
  Ctor.create = lib.ctor(Ctor);
  Ctor.prototype = Object.create(ParentCtor.prototype);
  Ctor.prototype.constructor = Ctor;
};
