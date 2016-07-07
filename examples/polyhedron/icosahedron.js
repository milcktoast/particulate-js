/*global THREE*/
(function () {

  // Icosahedron geometry
  // --------------------

  function icosahedron(radius) {
    var t = (1 + Math.sqrt(5)) / 2
    var verts = [
      -1,  t,  0,   1,  t,  0,   -1, -t,  0,   1, -t,  0,
      0, -1,  t,   0,  1,  t,    0, -1, -t,   0,  1, -t,
      t,  0, -1,   t,  0,  1,   -t,  0, -1,  -t,  0,  1
    ]

    for (var i = 0, il = verts.length; i < il; i ++) {
      verts[i] *= radius
    }
    return verts
  }

  var struts = [
    1,  3,  2,  0, // xy
    5,  7,  6,  4, // yz
    9, 11, 10,  8  // xz
  ]

  var edges = [
    0,  1,  2,  3,
    4,  5,  6,  7,
    8,  9, 10, 11,

    0, 11,  0, 10,
    1,  8,  1,  9,
    2, 10,  2, 11,
    3,  8,  3,  9,
    4,  2,  4,  3,
    5,  0,  5,  1,
    6,  2,  6,  3,
    7,  0,  7,  1,
    8,  6,  8,  7,
    9,  4,  9,  5,
    10, 6, 10,  7,
    11, 4, 11,  5
  ]

  // Simulation
  // ----------

  var PTCL = Particulate
  var RADIUS = 12
  var GRAVITY = -0.1

  var system = PTCL.ParticleSystem.create(icosahedron(RADIUS), 2)
  var gravityForce = PTCL.DirectionalForce.create()
  var bounds = PTCL.BoxConstraint.create([-50, -50, -50], [50, 50, 50])

  // Reference to links for visualization
  var linkIndices = edges.concat(struts)
  function createLinks() {
    var a, b, dist
    for (var i = 0, il = linkIndices.length / 2; i < il; i ++) {
      a = linkIndices[i * 2]
      b = linkIndices[i * 2 + 1]
      dist = system.getDistance(a, b)
      system.addConstraint(PTCL.DistanceConstraint.create(dist, a, b))
    }
  }

  createLinks()
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
    new THREE.LineBasicMaterial(), THREE.LinePieces)
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
