/*global THREE*/
(function () {

  // Simulation
  // ----------

  var PTCL = Particulate;
  var PARTICLES = 150;
  var LINK_DISTANCE = 1;
  var GRAVITY = -0.05;
  var system = new PTCL.ParticleSystem(PARTICLES, 2);
  var gravityForce = new PTCL.DirectionalForce();
  var bounds = new PTCL.BoxConstraint([-50, -50, -50], [50, 50, 50]);

  // Reference to links for visualization
  var linkIndices = [];

  system.each(function (i) {
    var a = i - 1;
    var b = i;

    if (i > 0 && i < PARTICLES - 1) {
      system.setPosition(i,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20);
    }

    if (i > 0) {
      linkIndices.push(a, b);
      system.addConstraint(new PTCL.DistanceConstraint(LINK_DISTANCE, a, b));
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
  demo.animate(function () {
    gravityForce.set(up.x * GRAVITY, up.y * GRAVITY, up.z * GRAVITY);
    system.tick(1);
    system.setPosition(0, -10, 0, 0);
    system.setPosition(PARTICLES - 1, 10, 0, 0);
    dots.attributes.position.needsUpdate = true;
    demo.update();
    demo.render();
  });
}());
