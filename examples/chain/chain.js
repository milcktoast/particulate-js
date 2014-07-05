/*global THREE*/
(function () {

  // Simulation
  // ----------

  var PTCL = Particulate;
  var PARTICLES = 150;
  var LINK_DISTANCE = 1;
  var GRAVITY = -0.05;
  var system = new PTCL.ParticleSystem(PARTICLES, 2);
  var bounds = new PTCL.BoxConstraint(-50, -50, -50, 50, 50, 50);
  var gravityForce = new PTCL.DirectionalForce();

  system.each(function (i) {
    if (i > 0 && i < PARTICLES - 1) {
      system.setPosition(i,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20);
    }

    if (i > 0) {
      system.addConstraint(new PTCL.DistanceConstraint(LINK_DISTANCE, i - 1, i));
    }
  });

  system.addConstraint(bounds);
  system.addForce(gravityForce);

  // Visualization
  // -------------

  var demo = new PTCL.DemoScene();
  demo.camera.position.set(0, 200, 500);

  var geometry = new THREE.BufferGeometry();
  var position = new THREE.BufferAttribute();
  position.array = system.positions;
  position.itemSize = 3;

  geometry.addAttribute('position', position);
  geometry.computeBoundingSphere();

  var material = new THREE.ParticleSystemMaterial({size: 2});
  var particleSystem = new THREE.ParticleSystem(geometry, material);
  demo.scene.add(particleSystem);

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
    geometry.attributes.position.needsUpdate = true;
    demo.update();
    demo.render();
  });
}());
