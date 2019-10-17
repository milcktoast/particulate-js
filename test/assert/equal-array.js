QUnit.assert.equalArray = function (actual, expected, message) {
  var isEqual = true

  for (var i = 0, il = expected.length; i < il; i ++) {
    if (actual[i] !== expected[i]) {
      isEqual = false
      break
    }
  }

  this.pushResult({
    result: isEqual,
    actual: actual,
    expected: expected,
    message: message
  })
}
