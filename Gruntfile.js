/*jshint node:true*/
module.exports = function (grunt) {
  'use strict';

  var config = {
    src: 'src/',
    dest: 'dist/',
    lib: 'node_modules/'
  };

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-neuter');

  grunt.initConfig({
    jshint: {
      all: {
        options: { jshintrc: true },
        files: { src: [config.src + '**/*.js'] }
      }
    },

    neuter: {
      lib: {
        options: {
          basePath: config.lib,
          template: '{%= src %}'
        },
        src: config.src + 'libs.js',
        dest: config.dest + 'libs-bundle.js'
      },
      src: {
        options: {
          basePath: config.src,
          template: '{%= src %}'
        },
        src: config.src + 'main.js',
        dest: config.dest + 'main-bundle.js'
      }
    },

    concat: {
      build: {
        src: [
          'intro.js',
          config.dest + 'main-bundle.js',
          'outro.js'
        ],
        dest: config.dest + 'particle-physics.js'
      }
    },

    uglify: {
      build: {
        src: config.dest + 'particle-physics.js',
        dest: config.dest + 'particle-physics.min.js'
      },
    },

    watch: {
      lib: {
        files: [config.src + 'libs.js'],
        tasks: ['neuter:lib']
      },
      src: {
        files: [config.src + '**/*', '!' + config.src + 'libs.js'],
        tasks: ['neuter:src']
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '*',
          base: config.dest,
          open: true
        }
      }
    }
  });

  grunt.registerTask('build', [
    'jshint',
    'neuter',
    'concat',
    'uglify'
  ]);

  grunt.registerTask('develop', function (port) {
    if (port) {
      grunt.config('connect.server.options.port', port);
    }

    grunt.task.run([
      'connect',
      'watch'
    ]);
  });

  grunt.registerTask('default', 'develop');
};
