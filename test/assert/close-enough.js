QUnit.assert.close = function (actual, expected, maxDifference, message) {
  var passes = (actual === expected) || Math.abs(actual - expected) <= maxDifference
  this.pushResult({
    result: passes,
    actual: actual,
    expected: expected,
    message: message
  })
}

QUnit.assert.closeArray = function (actual, expected, maxDifference, message) {
  var passes
  for (var i = 0, il = actual.length; i < il; i ++) {
    passes = (actual[i] === expected[i]) || Math.abs(actual[i] - expected[i]) <= maxDifference
    if (!passes) { break; }
  }
  this.pushResult({
    result: passes,
    actual: actual,
    expected: expected,
    message: message
  })
}

QUnit.assert.notClose = function (actual, expected, minDifference, message) {
  this.pushResult({
    result: Math.abs(actual - expected) > minDifference,
    actual: actual,
    expected: expected,
    message: message
  })
}
