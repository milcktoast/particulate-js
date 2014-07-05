/*global THREE*/
(function () {

  // Simulation
  // ----------

  var PARTICLES = 200;
  var LINK_DISTANCE = 1;
  var system = new PP.ParticleSystem(PARTICLES, 2);
  var bounds = new PP.BoxConstraint(-50, -50, -50, 50, 50, 50);

  system.each(function (i) {
    if (i > 0) {
      system.setPosition(i,
        (Math.random() - 0.5) * 20,
        50 - Math.random() * 20,
        (Math.random() - 0.5) * 20);

      system.addConstraint(new PP.DistanceConstraint(LINK_DISTANCE, i - 1, i));
    } else {
      system.setPosition(i, 0, 50, 0);
    }
  });

  system.addConstraint(bounds);

  // Visualization
  // -------------

  var demo = new PP.DemoScene();
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

  demo.animate(function () {
    system.tick(1);
    system.setPosition(0, 0, 50, 0);
    geometry.attributes.position.needsUpdate = true;
    demo.update();
    demo.render();
  });
}());
