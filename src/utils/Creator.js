lib.ctor = function ctor(Ctor) {
  return function () {
    var instance = Object.create(Ctor.prototype);
    Ctor.apply(instance, arguments);
    return instance;
  };
};
