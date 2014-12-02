/**
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
