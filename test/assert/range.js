QUnit.assert.range = function (actual, min, max, message) {
  var passes = actual >= min && actual <= max
  var expected = [min, max]
  this.pushResult({
    result: passes,
    actual: actual,
    expected: expected,
    message: message
  })
}
