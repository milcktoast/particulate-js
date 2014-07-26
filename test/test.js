var Test = window.Test = {
  assert : {}
};

require('assert/*');
require('utils/*');
require('forces/*');
require('constraints/*');
require('systems/*');

function setFavicon(uri) {
  var link = document.getElementById('favicon');
  if (link) {
    document.head.removeChild(link);
  } else {
    link = document.createElement('link');
  }

  link.setAttribute('id', 'favicon');
  link.setAttribute('type', 'image/x-icon');
  link.setAttribute('rel', 'icon');
  link.setAttribute('href', uri);
  document.head.appendChild(link);
}

QUnit.done(function (results) {
  if (results.failed) {
    setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2P8z8AAROQDxlEDGEbDgGE0DIBZaBikAwCl1B/x0/RuTAAAAABJRU5ErkJggg==');
    document.title = results.failed + ' of ' + results.total + ' failed.';
  } else {
    setFavicon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAHklEQVQ4T2Nk+A+EFADGUQMYRsOAYTQMgHloGKQDAJXkH/HZpKBrAAAAAElFTkSuQmCC');
    document.title = 'All ' + results.total + ' passed.';
  }
});
