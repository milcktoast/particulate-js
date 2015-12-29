# Particulate.js

[![Stability][stability-image]][stability-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Code Climate][climate-image]][climate-url]
[![Inline Docs][docs-image]][docs-url]

Particulate.js is a JavaScript particle physics micro library (~3.7kb gz) designed to be simple, extensible, fast, and stable;
it is capable of running a simulation with tens of thousands of particles and tens of thousands of constraints in real time.
The core system is derived from that described in [Advanced Character Physics by Thomas Jakobsen][adv-phys-url].

[Website](http://particulatejs.org) –
[Examples](http://particulatejs.org/examples/) –
[Docs](http://particulatejs.org/docs/) –
[Tests](http://particulatejs.org/test/)

## Usage

The library provides an interface for defining a particle system with many inter-particle constraints
and globally acting forces. Internal management of particle positions and state is designed to be easily integrated
with a WebGL rendering pipeline, although no specific rendering scheme is required.

### Install

Install with **npm** or **bower** or download the [built package][dist-url].

```sh
npm install particulate --save
```

```sh
bower install particulate --save
```

Then include the library as an AMD or commonJS module, or browser global.

```js
define(['particulate'], function (Particulate) { /* ... */ });
```

```js
var Particulate = require('particulate');
```

```js
var Particulate = window.Particulate;
```

### Integrate Renderer

The following is a simplified version of the [chain example](http://particulatejs.org/examples/#chain/chain.html),
rendered with [Three.js][three-url]:

```js
// ..................................................
// Define particle chain system
//

var particleCount = 5;
var relaxIterations = 2;

var system = Particulate.ParticleSystem.create(particleCount, relaxIterations);
var dist = Particulate.DistanceConstraint.create(10, [0, 1, 1, 2, 2, 3, 3, 4]);
var pin = Particulate.PointConstraint.create([0, 0, 0], 0);
var gravity = Particulate.DirectionalForce.create([0, -0.05, 0]);

system.addConstraint(dist);
system.addPinConstraint(pin);
system.addForce(gravity);

// ..................................................
// Integrate with Three.js
//

var scene = new THREE.Scene();

// Use system positions buffer
var vertices = new THREE.BufferAttribute(system.positions, 3);

// Use distance constraint indices
var indices = new THREE.BufferAttribute(new Uint16Array(dist.indices));

// Particles
var dotsGeom = new THREE.BufferGeometry();
dotsGeom.addAttribute('position', vertices);

var dots = new THREE.PointCloud(dotsGeom,
  new THREE.PointCloudMaterial({ size : 2 }));

// Connections
var linesGeom = new THREE.BufferGeometry();
linesGeom.addAttribute('position', vertices);
linesGeom.addAttribute('index', indices);

var lines = new THREE.Line(linesGeom,
  new THREE.LineBasicMaterial());

scene.add(dots);
scene.add(lines);

function animate() {
  system.tick(1);
  dotsGeom.attributes.position.needsUpdate = true; // Flag to update WebGL buffer
  render();
}
```

## Development

[Grunt][grunt-url] is used for building and testing the library.
You should have one path for each dependency:

```sh
which node npm grunt
```

After resolving development dependencies, run:

```sh
npm install
```

### Test

Run a development server with `grunt server`.
Visit `localhost:8000/examples/` to view examples or `localhost:8000/test/` to run tests.
The development version of the library will be automatically rebuilt when any file matching `/src/**/*` changes.

Tests can also be run from the command line with `grunt test`.

### Build

Running `grunt build` will generate a fully commented development version of the library as well as
a minified production version in `/dist`.

### Document

Source code is documented in-line using [YUIDoc syntax](http://yui.github.io/yuidoc/syntax/index.html)
and compiled by running `grunt yuidoc`.

### Contribute

There is not a formal style guide, but please maintain the existing coding style.
Any new or changed functionality should be documented and covered by unit tests.


[adv-phys-url]: http://web.archive.org/web/20080410171619/http://www.teknikus.dk/tj/gdc2001.htm
[dist-url]: http://particulatejs.org/dist/particulate.js
[three-url]: http://threejs.org
[grunt-url]: http://gruntjs.com/
[yuidoc-url]: http://yui.github.io/yuidoc/syntax/index.html

[stability-url]: https://nodejs.org/api/documentation.html#documentation_stability_index
[stability-image]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[travis-url]: https://travis-ci.org/jpweeks/particulate-js
[travis-image]: https://img.shields.io/travis/jpweeks/particulate-js/develop.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jpweeks/particulate-js
[coveralls-image]: https://img.shields.io/coveralls/jpweeks/particulate-js/develop.svg?style=flat-square
[climate-url]: https://codeclimate.com/github/jpweeks/particulate-js/code
[climate-image]: https://img.shields.io/codeclimate/github/jpweeks/particulate-js.svg?style=flat-square
[docs-url]: https://inch-ci.org/github/jpweeks/particulate-js
[docs-image]: https://inch-ci.org/github/jpweeks/particulate-js.svg?branch=master&style=flat-square
