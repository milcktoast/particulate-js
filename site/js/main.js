var App = window.App = {};

require('../dist/particulate.js');

// Three.js
require('lib/three/controls/TrackballControls');
require('lib/three/geometries/PlaneBufferGeometry');

require('lib/three/shaders/CopyShader');
require('lib/three/shaders/ConvolutionShader');

require('lib/three/postprocessing/EffectComposer');
require('lib/three/postprocessing/MaskPass');
require('lib/three/postprocessing/RenderPass');
require('lib/three/postprocessing/ShaderPass');
require('lib/three/postprocessing/BloomPass');

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
