/*jshint node:true*/
module.exports = function (grunt) {
  'use strict';

  var config = {
    version: '0.3.2',
    src: 'src/',
    dest: 'dist/',
    test: 'test/',
    site: 'site/',
    docs: 'docs/',
    docsTheme: 'docs-theme/',
    lib: 'node_modules/'
  };

  require('jit-grunt')(grunt, {
    qunit: 'grunt-qunit-istanbul'
  });

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
      },
      site: {
        options: {
          basePath: config.site,
        },
        src: config.site + 'js/main.js',
        dest: config.site + 'main-bundle.js'
      }
    },

    umd: {
      src: {
        options: {
          objectToExport: 'lib',
          amdModuleId: 'particulate',
          globalAlias: 'Particulate',
          template: config.src + 'wrap.hbs'
        },
        src: config.dest + 'particulate.js'
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
      },
      site: {
        src: config.site + 'main-bundle.js',
        dest: config.site + 'main-bundle.js'
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
      },
      site: {
        files: [config.site + '**/*', '!' + config.site + '**/main-bundle.js'],
        tasks: ['neuter:site']
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
  });


  grunt.registerTask('develop', [
    'jshint',
    'neuter:src',
    'umd',
    'neuter:test',
    'neuter:site'
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
      'watch:src',
      'watch:test'
    ]);
  });

  grunt.registerTask('default', 'server');
};
