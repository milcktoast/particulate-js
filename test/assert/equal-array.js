Test.assert.equalArray = assert_equalArray
function assert_equalArray(actual, expected, message) {
  var isEqual = true

  for (var i = 0, il = expected.length; i < il; i ++) {
    if (actual[i] !== expected[i]) {
      isEqual = false
      break
    }
  }

  QUnit.push(isEqual, actual, expected, message)
}
