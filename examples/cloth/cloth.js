/*global THREE*/
(function () {

  // Simulation
  // ----------

  var PTCL = Particulate;
  var WIDTH = 30;
  var HEIGHT = 30;
  var PARTICLES = WIDTH * HEIGHT;
  var LINK_DISTANCE = 2;
  var GRAVITY = -0.05;
  var system = new PTCL.ParticleSystem(PARTICLES, 2);
  var gravityForce = new PTCL.DirectionalForce();
  var bounds = new PTCL.BoxConstraint([-50, -50, -50], [50, 50, 50]);

  // Reference to links for visualization
  var linkIndices = [];

  function addLink(a, b) {
    linkIndices.push(a, b);
    system.addConstraint(new PTCL.DistanceConstraint(LINK_DISTANCE, a, b));
  }

  (function createClothLinks() {
    var i, h, w;
    for (h = 0; h < HEIGHT; h ++) {
      for (w = 0; w < WIDTH; w ++) {
        i = h * WIDTH + w;
        if (h > 0) {
          addLink(i - WIDTH, i);
        }
        if (w > 0) {
          addLink(i - 1, i);
        }
      }
    }
  }());

  system.each(function (i) {
    if (i !== 0 && i !== WIDTH) {
      system.setPosition(i,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20);
    }
  });

  system.addConstraint(bounds);
  system.addForce(gravityForce);

  // Visualization
  // -------------

  var demo = new PTCL.DemoScene();
  demo.camera.position.set(0, 200, 500);

  var vertices = new THREE.BufferAttribute();
  vertices.array = system.positions;
  vertices.itemSize = 3;

  var indices = new THREE.BufferAttribute();
  indices.array = new Uint16Array(linkIndices);

  // Particles
  var dots = new THREE.BufferGeometry();
  dots.addAttribute('position', vertices);

  var visParticles = new THREE.ParticleSystem(dots,
    new THREE.ParticleSystemMaterial({size: 2}));
  demo.scene.add(visParticles);

  // Connections
  var lines = new THREE.BufferGeometry();
  lines.addAttribute('position', vertices);
  lines.addAttribute('index', indices);

  var visConnectors = new THREE.Line(lines,
    new THREE.LineBasicMaterial());
  demo.scene.add(visConnectors);

  // Bounds
  var box = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      wireframe : true
    }));
  demo.scene.add(box);

  var up = demo.controls.object.up;
  var pinX = WIDTH * LINK_DISTANCE * 0.5;
  demo.animate(function () {
    gravityForce.set(up.x * GRAVITY, up.y * GRAVITY, up.z * GRAVITY);
    system.tick(1);
    system.setPosition(0, -pinX, 0, 0);
    system.setPosition(WIDTH - 1, pinX, 0, 0);
    dots.attributes.position.needsUpdate = true;
    demo.update();
    demo.render();
  });
}());
