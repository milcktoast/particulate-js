/*global THREE*/
Particulate.DemoScene = DemoScene
function DemoScene() {
  this.el = document.getElementById('container')
  this.renderer = new THREE.WebGLRenderer({antialias: false})
  this.renderer.setClearColor(0x111111, 1)
  this.el.appendChild(this.renderer.domElement)

  this.scene = new THREE.Scene()
  this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 5, 3500)

  this.initControls()
  this.onWindowResize()
  window.addEventListener('resize', this.onWindowResize.bind(this), false)
}

DemoScene.create = function () {
  return new DemoScene()
}

DemoScene.prototype.initControls = function () {
  var controls = new THREE.TrackballControls(this.camera, this.el)
  controls.rotateSpeed = 1.5
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.9
  controls.noZoom = false
  controls.noPan = false
  controls.staticMoving = true
  controls.dynamicDampingFactor = 0.3
  controls.keys = [65, 17, 16]
  this.controls = controls
}

DemoScene.prototype.onWindowResize = function () {
  this.width = window.innerWidth
  this.height = window.innerHeight
  this.camera.aspect = this.width / this.height
  this.camera.updateProjectionMatrix()
  this.renderer.setSize(this.width, this.height)
}

DemoScene.prototype.update = function () {
  this.controls.update()
}

DemoScene.prototype.render = function () {
  this.renderer.render(this.scene, this.camera)
}

DemoScene.prototype.animate = function (frame) {
  this._frame = frame
  this._animate = this._animate.bind(this)
  this._animate()
}

DemoScene.prototype._animate = function () {
  window.requestAnimationFrame(this._animate)
  this._frame()
}
