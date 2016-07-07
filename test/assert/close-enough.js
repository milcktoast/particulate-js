Test.assert.close = assert_close
function assert_close(actual, expected, maxDifference, message) {
  var passes = (actual === expected) || Math.abs(actual - expected) <= maxDifference
  QUnit.push(passes, actual, expected, message)
}

Test.assert.closeArray = assert_closeMany
function assert_closeMany(actual, expected, maxDifference, message) {
  var passes
  for (var i = 0, il = actual.length; i < il; i ++) {
    passes = (actual[i] === expected[i]) || Math.abs(actual[i] - expected[i]) <= maxDifference
    if (!passes) { break; }
  }
  QUnit.push(passes, actual, expected, message)
}

Test.assert.notClose = assert_notClose
function assert_notClose(actual, expected, minDifference, message) {
  QUnit.push(Math.abs(actual - expected) > minDifference, actual, expected, message)
}
