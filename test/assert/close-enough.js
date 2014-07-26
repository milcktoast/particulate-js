Test.assert.close = assert_close;
function assert_close(actual, expected, maxDifference, message) {
  var passes = (actual === expected) || Math.abs(actual - expected) <= maxDifference;
  QUnit.push(passes, actual, expected, message);
}

Test.assert.notClose = assert_notClose;
function assert_notClose(actual, expected, minDifference, message) {
  QUnit.push(Math.abs(actual - expected) > minDifference, actual, expected, message);
}
