/*jshint node:true*/
module.exports = function (grunt) {
  'use strict';

  var config = {
    src: 'src/',
    dest: 'dist/',
    lib: 'node_modules/'
  };

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
      src: {
        options: {
          basePath: config.src,
          template: '{%= src %}'
        },
        src: config.src + 'main.js',
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
      src: {
        files: [config.src + '**/*'],
        tasks: ['neuter:src']
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
    }
  });

  grunt.registerTask('build', [
    'jshint',
    'neuter',
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
