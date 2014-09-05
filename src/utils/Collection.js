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
