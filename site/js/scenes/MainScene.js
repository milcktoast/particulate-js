/*global THREE*/
App.MainScene = MainScene;
function MainScene() {
  this.el = document.getElementById('container');

  this.initScene();
  this.initSimulation();
  this.initVisualization();
  this.initRenderer();
  this.initPostFX();
  this.initControls();
  this.onWindowResize();

  this.animate = this.animate.bind(this);
  this.onWindowResize = this.onWindowResize.bind(this);
  this.onMouseMove = this.onMouseMove.bind(this);

  window.addEventListener('resize', this.onWindowResize, false);
  document.addEventListener('mousemove', this.onMouseMove, false);
}

MainScene.prototype.initScene = function () {
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);
  this.camera.position.set(0, 50, 100);
  this.camera.lookAt(this.scene.position);
};

MainScene.prototype.initSimulation = function () {
  var tris = 5000;
  var particles = tris * 3;
  var distance = 0.8;
  var simulation = Particulate.ParticleSystem.create(particles, 2);

  var attractor = Particulate.PointForce.create([0, 0, 0], {
    type : Particulate.Force.ATTRACTOR,
    intensity : 0.15,
    radius : 30
  });

  var repulsor = Particulate.PointForce.create([0, 0, 0], {
    type : Particulate.Force.REPULSOR,
    intensity : 0.15,
    radius : 20
  });

  var linkIndices = this.linkIndices = [];

  // FIXME
  function addLink(a, b) {
    linkIndices.push(a, b);
    simulation._localConstraints.push(Particulate.DistanceConstraint.create(distance, a, b));
  }

  var a, b, c;
  for (var i = 2, il = particles; i < il; i ++) {
    a = i;
    b = a - 1;
    c = a - 2;
    addLink(a, b);
    addLink(b, c);
    addLink(c, a);
  }

  simulation.each(function (i) {
    simulation.setPosition(i,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50);
  });

  simulation.addForce(attractor);
  simulation.addForce(repulsor);

  this.simulation = simulation;
};

MainScene.prototype.initVisualization = function () {
  var vertices = new THREE.BufferAttribute();
  vertices.array = this.simulation.positions;
  vertices.itemSize = 3;

  var indices = new THREE.BufferAttribute();
  indices.array = new Uint16Array(this.linkIndices);

  // Particles
  var texture = THREE.ImageUtils.loadTexture('/site/img/particle.png');
  var dots = new THREE.BufferGeometry();
  dots.addAttribute('position', vertices);

  var visParticles = new THREE.ParticleSystem(dots,
    new THREE.ParticleSystemMaterial({
      blending : THREE.AdditiveBlending,
      transparent : true,
      map : texture,
      size : 1.5
    }));
  this.scene.add(visParticles);

  // Connections
  var lines = new THREE.BufferGeometry();
  lines.addAttribute('position', vertices);
  lines.addAttribute('index', indices);

  var visConnectors = new THREE.Line(lines,
    new THREE.LineBasicMaterial({
      color : 0xffffff,
      linewidth : 1
    }));
  this.scene.add(visConnectors);

  this.dots = dots;
  this.lines = lines;
};

MainScene.prototype.initRenderer = function () {
  var renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.autoClear = false;
  renderer.setClearColor(0x050505, 1);

  this.el.appendChild(renderer.domElement);
  this.renderer = renderer;
};

MainScene.prototype.initPostFX = function () {
  var composer = new THREE.EffectComposer(this.renderer);
  var renderScene = new THREE.RenderPass(this.scene, this.camera);
  var bloom = new THREE.BloomPass(1.2);
  var copy = new THREE.ShaderPass(THREE.CopyShader);

  copy.renderToScreen = true;

  composer.addPass(renderScene);
  composer.addPass(bloom);
  composer.addPass(copy);

  this.composer = composer;
};

MainScene.prototype.initControls = function () {
  this.mouse = [0, 0];
};

MainScene.prototype.onMouseMove = function (event) {
  this.mouse[0] = event.clientX - this.width * 0.5;
  this.mouse[1] = event.clientY - this.height * 0.5;
};

MainScene.prototype.onWindowResize = function () {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var pxRatio = window.devicePixelRatio || 1;
  var postWidth = width * pxRatio;
  var postHeight = height * pxRatio;

  this.width = width;
  this.height = height;

  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.composer.setSize(postWidth, postHeight);
  this.renderer.setSize(this.width, this.height);
};

MainScene.prototype.update = function () {
  var mouse = this.mouse;
  var camera = this.camera;

  camera.position.x +=  (mouse[0] * 0.3 - camera.position.x) * 0.05;
  camera.position.y += (-mouse[1] * 0.3 - camera.position.y) * 0.05;
  camera.lookAt(this.scene.position);

  this.simulation.tick(1);
  this.lines.attributes.position.needsUpdate = true;
};

MainScene.prototype.render = function () {
  this.composer.render(0.1);
};

MainScene.prototype.animate = function () {
  window.requestAnimationFrame(this.animate);
  this.update();
  this.render();
};
