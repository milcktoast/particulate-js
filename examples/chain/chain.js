/*global THREE*/
(function () {

  // Simulation
  // ----------

  var PTCL = Particulate
  var PARTICLES = 150
  var LINK_DISTANCE = 2
  var GRAVITY = -0.02
  var system = PTCL.ParticleSystem.create(PARTICLES, 2)
  var gravityForce = PTCL.DirectionalForce.create()
  var bounds = PTCL.BoxConstraint.create([-50, -50, -50], [50, 50, 50])

  var linkIndices = []
  var angleIndices = []

  system.each(function (i) {
    var a = i - 1
    var b = i

    if (i > 0 && i < PARTICLES - 1) {
      system.setPosition(i,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20)
    }

    if (i > 0) {
      linkIndices.push(a, b)
    }

    if (i > 0 && i < PARTICLES - 1) {
      angleIndices.push(a, b, b + 1)
    }
  })

  system.addConstraint(PTCL.DistanceConstraint.create(LINK_DISTANCE, linkIndices))
  system.addConstraint(PTCL.AngleConstraint.create(Math.PI * 0.5, angleIndices))

  var pinX = 10
  var index0 = 0
  var index1 = PARTICLES - 1
  var pin0 = PTCL.PointConstraint.create([-pinX, 0, 0], index0)
  var pin1 = PTCL.PointConstraint.create([ pinX, 0, 0], index1)

  system.setWeight(index0, 0)
  system.setWeight(index1, 0)
  system.addPinConstraint(pin0)
  system.addPinConstraint(pin1)

  system.addConstraint(bounds)
  system.addForce(gravityForce)

  // Visualization
  // -------------

  var demo = PTCL.DemoScene.create()
  demo.camera.position.set(0, 200, 500)

  var vertices = new THREE.BufferAttribute()
  vertices.array = system.positions
  vertices.itemSize = 3

  var indices = new THREE.BufferAttribute()
  indices.array = new Uint16Array(linkIndices)

  // Particles
  var dots = new THREE.BufferGeometry()
  dots.addAttribute('position', vertices)

  var visParticles = new THREE.PointCloud(dots,
    new THREE.PointCloudMaterial({size: 2}))
  demo.scene.add(visParticles)

  // Connections
  var lines = new THREE.BufferGeometry()
  lines.addAttribute('position', vertices)
  lines.addAttribute('index', indices)

  var visConnectors = new THREE.Line(lines,
    new THREE.LineBasicMaterial())
  demo.scene.add(visConnectors)

  // Bounds
  var box = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      wireframe : true
    }))
  demo.scene.add(box)

  var up = demo.controls.object.up
  demo.animate(function () {
    gravityForce.set(up.x * GRAVITY, up.y * GRAVITY, up.z * GRAVITY)
    system.tick(1)
    dots.attributes.position.needsUpdate = true
    demo.update()
    demo.render()
  })
}())
