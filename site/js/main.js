var App = window.App = {};

require('../dist/particulate.js');

require('../node_modules/three/examples/js/shaders/ConvolutionShader.js');
require('../node_modules/three/examples/js/shaders/CopyShader.js');

require('../node_modules/three/examples/js/postprocessing/EffectComposer.js');
require('../node_modules/three/examples/js/postprocessing/MaskPass.js');
require('../node_modules/three/examples/js/postprocessing/RenderPass.js');
require('../node_modules/three/examples/js/postprocessing/ShaderPass.js');
require('../node_modules/three/examples/js/postprocessing/BloomPass.js');

require('../node_modules/three/examples/js/controls/TrackballControls.js');

require('js/utils/*');
require('js/scenes/*');
require('js/controllers/*');

var router = new App.HardPathRouter('/');
router.add('', function () {
  var scene = new App.MainScene();
  scene.animate();
});
router.add('examples/', function () {
  var examples = new App.ExamplesController();
});
router.match();
