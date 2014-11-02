App.ExamplesController = ExamplesController;
function ExamplesController() {
  this.iframe = document.getElementById('examples-iframe');
  this.select = document.getElementById('examples-select');

  this.initOptions();
  this.updateSelect(window.location.hash.replace('#', ''));
  this.select.addEventListener('change', this.updateSelection.bind(this), false);
}

ExamplesController.prototype.initOptions = function () {
  var options = this.select.options;
  var values = this._values = [];
  for (var i = 0, il = options.length; i < il; i ++) {
    values.push(options[i].value);
  }
};

ExamplesController.prototype.updateSelect = function (value) {
  var index = this._values.indexOf(value);
  if (index < 0) { return; }
  this.select.selectedIndex = index;
  this.updateIframe(value);
};

ExamplesController.prototype.updateHash = function (value) {
  window.location.hash = value;
};

ExamplesController.prototype.updateSelection = function (event) {
  var select = this.select;
  var src = select.options[select.selectedIndex].value;
  this.updateIframe(src);
  this.updateHash(src);
};

ExamplesController.prototype.updateIframe = function (src) {
  this.iframe.src = src ? '/examples/' + src : '';
};
