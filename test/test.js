window.Test = {
  assert : {}
}

require('assert/*')
require('systems/*')
require('constraints/Constraint')
require('constraints/*')
require('forces/Force')
require('forces/*')
require('math/*')
require('utils/*')

function setFavicon(uri) {
  var link = document.getElementById('favicon')
  if (link) {
    document.head.removeChild(link)
  } else {
    link = document.createElement('link')
  }

  link.setAttribute('id', 'favicon')
  link.setAttribute('type', 'image/x-icon')
  link.setAttribute('rel', 'icon')
  link.setAttribute('href', uri)
  document.head.appendChild(link)
}

QUnit.done(function (results) {
  if (results.failed) {
    setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANElEQVQ4T2NkoBAwUqifgboG/GdgACLCAGgr3GIUF4waAA7B0UCkNAwIp0FMFdTNC+S4AAAt7hQR+uwkyQAAAABJRU5ErkJggg==')
    document.title = results.failed + ' of ' + results.total + ' failed.'
  } else {
    setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAM0lEQVQ4T2NkoBAwUqifgcoG/Gf4T5SLGBEWo7pg1AAGYBCOBiLFYUBUMkRVROW8QIYLACPuFBFvqDn4AAAAAElFTkSuQmCC')
    document.title = 'All ' + results.total + ' passed.'
  }
})
