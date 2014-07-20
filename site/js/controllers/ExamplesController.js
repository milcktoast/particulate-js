App.ExamplesController = ExamplesController;
function ExamplesController() {
  this.iframe = document.getElementById('examples-iframe');
  this.select = document.getElementById('examples-select');

  this.select.addEventListener('change', this.updateSelection.bind(this), false);
}

ExamplesController.prototype.updateSelection = function (event) {
  var select = this.select;
  var src = select.options[select.selectedIndex].value;
  this.iframe.src = src ? '/examples/' + src : '';
};
