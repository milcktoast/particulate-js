/*jshint node:true*/
module.exports = function (grunt) {
  'use strict'

  var config = {
    version: '0.3.3',
    src: 'src/',
    dest: 'dist/',
    test: 'test/',
    docs: 'docs/',
    docsTheme: 'docs-theme/',
    lib: 'node_modules/'
  }

  require('jit-grunt')(grunt, {
    qunit: 'grunt-qunit-istanbul',
    usebanner: 'grunt-banner'
  })

  grunt.initConfig({
    jshint: {
      src: {
        options: { jshintrc: true },
        src: [config.src + '**/*.js']
      },
      test: {
        options: { jshintrc: true },
        src: [config.test + '**/*.js', '!' + config.test + 'test-bundle.js']
      }
    },

    rollup: {
      src: {
        options: {
          moduleName: 'Particulate',
          format: 'umd'
        },
        src: config.src + 'index.js',
        dest: config.dest + 'particulate.js'
      }
    },

    usebanner: {
      src: {
        options: {
          position: 'top',
          banner: [
            '// ..................................................',
            '// Particulate.js',
            '//',
            '// version : 0.3.3',
            '// authors : Jay Weeks',
            '// license : MIT',
            '// particulatejs.org',
            '// ..................................................',
            ''
          ].join('\n')
        },
        files: {
          src: [config.dest + 'particulate.js']
        }
      }
    },

    neuter: {
      test: {
        options: {
          basePath: config.test
        },
        src: config.test + 'test.js',
        dest: config.test + 'test-bundle.js'
      }
    },

    // TODO: Generate coverage report relative to source files
    qunit: {
      main: ['test/index.html'],
      options: {
        '--web-security': 'no',
        coverage: {
          disposeCollector: true,
          src: ['dist/particulate.js'],
          instrumentedFiles: 'test-temp/',
          htmlReport: 'test-report/coverage',
          lcovReport: 'test-report/lcov'
        }
      },
    },

    coveralls: {
      options: {
        force: true
      },
      main: {
        src: 'test-report/lcov/lcov.info'
      }
    },

    uglify: {
      build: {
        src: config.dest + 'particulate.js',
        dest: config.dest + 'particulate.min.js'
      },
      test: {
        src: config.test + 'test-bundle.js',
        dest: config.test + 'test-bundle.js'
      }
    },

    watch: {
      src: {
        files: [config.src + '**/*'],
        tasks: ['neuter:src', 'umd:src']
      },
      test: {
        files: [config.test + '**/*', '!' + config.test + 'test-bundle.js'],
        tasks: ['neuter:test']
      },
      docs: {
        files: [config.src + '**/*', config.docsTheme + '**/*'],
        tasks: ['yuidoc:main']
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '*',
          base: '',
          open: true
        }
      }
    },

    yuidoc: {
      main: {
        name: 'Particulate.js',
        url: 'particulatejs.org',
        version: config.version,
        options: {
          paths: config.src,
          themedir: config.docsTheme,
          outdir: config.docs,
          nocode: true
        }
      }
    }
  })


  grunt.registerTask('develop', [
    'jshint',
    'rollup',
    'neuter'
  ])

  grunt.registerTask('build', [
    'develop',
    'uglify',
    'usebanner'
  ])

  grunt.registerTask('test', [
    'develop',
    'qunit',
    'coveralls'
  ])

  grunt.registerTask('server', function (port) {
    grunt.config('connect.server.options.port', port || 8000)
    grunt.task.run([
      'develop',
      'connect',
      'watch'
    ])
  })

  grunt.registerTask('default', 'server')
}
