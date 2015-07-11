/*global THREE*/
var DEBUG_REPULSOR = false;

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

  this.frame = 0;
  this.animate = this.animate.bind(this);
  this.onWindowResize = this.onWindowResize.bind(this);
  this.onMouseMove = this.onMouseMove.bind(this);

  window.addEventListener('resize', this.onWindowResize, false);
  document.addEventListener('mousemove', this.onMouseMove, false);
}

MainScene.prototype.initScene = function () {
  this.scene = new THREE.Scene();
  this.scene.fog = new THREE.Fog(0x050505, 1, 200);
  this.camera = new THREE.PerspectiveCamera(30, 1, 5, 3500);
  this.camera.position.set(0, 50, 100);
  this.camera.lookAt(this.scene.position);
};

MainScene.prototype.initSimulation = function () {
  var tris = 5000;
  var particles = tris * 3;
  var distance = this.distance = 1.5;
  var simulation = Particulate.ParticleSystem.create(particles, 2);

  var bounds = Particulate.PointForce.create([0, 0, 0], {
    type : Particulate.Force.ATTRACTOR_REPULSOR,
    intensity : 0.05,
    radius : 25
  });

  var pointRepulsor = Particulate.PointForce.create([0, 0, 0], {
    type : Particulate.Force.REPULSOR,
    intensity : 1,
    radius : 8
  });

  var linkIndices = this.linkIndices = [];
  var visIndices = this.visIndices = [];
  (function () {
    var a, b, c;
    for (var i = 2, il = particles; i < il; i ++) {
      a = i;
      b = a - 1;
      c = a - 2;
      linkIndices.push(a, b, b, c, c, a);
      visIndices.push(a);
    }
  }());

  simulation.each(function (i) {
    simulation.setPosition(i,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10);
  });

  var distances = this.distanceConstraint = Particulate.DistanceConstraint.create(
    [distance * 0.5, distance], linkIndices);

  simulation.addConstraint(distances);
  simulation.addForce(bounds);

  (function relax() {
    for (var i = 0; i < 50; i ++) {
      simulation.tick(1);
    }
  }());

  simulation.addForce(pointRepulsor);
  this.pointRepulsor = pointRepulsor;
  this.simulation = simulation;
};

MainScene.prototype.initVisualization = function () {
  var vertices = new THREE.BufferAttribute(this.simulation.positions, 3);
  var indices = new THREE.BufferAttribute(new Uint16Array(this.visIndices), 1);

  // Particles
  var texture = THREE.ImageUtils.loadTexture('/site/img/particle.png');
  var dots = new THREE.BufferGeometry();
  dots.addAttribute('position', vertices);

  var visParticles = new THREE.PointCloud(dots,
    new THREE.PointCloudMaterial({
      color : 0xffffff,
      blending : THREE.AdditiveBlending,
      transparent : true,
      map : texture,
      size : 1.5,
      opacity : 0.9,
      // fog : false
    }));

  // Connections
  var lines = new THREE.BufferGeometry();
  lines.addAttribute('position', vertices);
  lines.addAttribute('index', indices);

  var debugRepulsor = new THREE.Mesh(new THREE.SphereGeometry(5),
    new THREE.MeshBasicMaterial({
      fog : false,
      wireframe : true,
      transparent : true,
      opacity : 0.5
    }));

  var visConnectors = new THREE.Line(lines,
    new THREE.LineBasicMaterial({
      blending : THREE.AdditiveBlending,
      transparent : true,
      color : 0xffffff,
      linewidth : 1,
      opacity : 0.5
    }));

  this.scene.add(visParticles);
  this.scene.add(visConnectors);

  if (DEBUG_REPULSOR) {
    this.scene.add(debugRepulsor);
  }

  this.dots = dots;
  this.lines = lines;
  this.debugRepulsor = debugRepulsor;
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
  this.mouseWorld = [0, 0];
  this.mousePoint = new THREE.Vector3(0, 0, 0.5);
};

MainScene.prototype.onMouseMove = function (event) {
  var width = this.width;
  var height = this.height;
  var mouse = this.mouse;
  var mouseWorld = this.mouseWorld;

  mouse[0] = event.clientX - width * 0.5;
  mouse[1] = event.clientY - height * 0.5;

  mouseWorld[0] = (event.clientX / width) * 2 - 1;
  mouseWorld[1] = - (event.clientY / height) * 2 + 1;
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

MainScene.prototype.distances = [2.5, 10, 7.5, 0.5];
MainScene.prototype.distIndex = 0;

MainScene.prototype.update = function () {
  var camera = this.camera;
  var mouse = this.mouse;
  var mouseWorld = this.mouseWorld;
  var mousePoint = this.mousePoint;
  var frame = this.frame;

  if (frame % 250 === 0) {
    this._distTarget = this.distances[this.distIndex];

    if (this.distIndex + 2 > this.distances.length) {
      this.distIndex = 0;
    } else {
      this.distIndex += 1;
    }
  }

  var dist = this.distance += (this._distTarget - this.distance) * 0.05;

  camera.position.x +=  (mouse[0] * 0.3 - camera.position.x) * 0.05;
  camera.position.y += (-mouse[1] * 0.3 - camera.position.y) * 0.05;
  camera.lookAt(this.scene.position);

  mousePoint.x = mouseWorld[0] * 70;
  mousePoint.y = mouseWorld[1] * 70;
  mousePoint.z = -0.5;

  mousePoint.unproject(camera);
  mousePoint.normalize();
  mousePoint.multiplyScalar(25);

  this.distanceConstraint.setDistance(dist * 0.25, dist);
  this.pointRepulsor.set(mousePoint.x, mousePoint.y, mousePoint.z);
  this.simulation.tick(0.5);
  this.scene.fog.far = camera.position.length() * 1.75;
  this.lines.attributes.position.needsUpdate = true;

  if (DEBUG_REPULSOR) {
    this.debugRepulsor.position.copy(mousePoint);
  }
};

MainScene.prototype.render = function () {
  this.composer.render(0.1);
};

MainScene.prototype.animate = function () {
  window.requestAnimationFrame(this.animate);
  this.update();
  this.render();
  this.frame ++;
};
