/*jshint node:true*/
module.exports = function (grunt) {
  'use strict';

  var config = {
    src: 'src/',
    dest: 'dist/',
    test: 'test/',
    docs: 'docs/',
    lib: 'node_modules/'
  };

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-neuter');

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

    neuter: {
      src: {
        options: {
          basePath: config.src,
          template: '{%= src %}',
          sourceRoot: '../',
          includeSourceMap: false
        },
        src: config.src + 'main.js',
        dest: config.dest + 'particulate.js'
      },
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
        tasks: ['neuter:src']
      },
      test: {
        files: [config.test + '**/*', '!' + config.test + 'test-bundle.js'],
        tasks: ['neuter:test']
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
        options: {
          paths: config.src,
          theme: 'simple',
          outdir: config.docs
        }
      }
    }
  });


  grunt.registerTask('develop', [
    'jshint',
    'neuter'
  ]);

  grunt.registerTask('build', [
    'develop',
    'uglify'
  ]);

  grunt.registerTask('test', [
    'develop',
    'qunit',
    'coveralls'
  ]);

  grunt.registerTask('server', function (port) {
    grunt.config('connect.server.options.port', port || 8000);
    grunt.task.run([
      'develop',
      'connect',
      'watch'
    ]);
  });

  grunt.registerTask('default', 'server');
};
