Test.assert.range = assert_range
function assert_range(actual, min, max, message) {
  var passes = actual >= min && actual <= max
  var expected = [min, max]
  QUnit.push(passes, actual, expected, message)
}
