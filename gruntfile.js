module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
      }
    },

    uglify: {
      build: {
        files: {
          'modal.js': ['lib/jquery.center.js', 'src/js/modal.js']
        }
      }
    },

    jshint: {
      options: {
        expr: true
      },

      all: ['gruntfile.js', 'src/js/*.js', 'test/spec/*.js']
    },

    watch: {
      js: {
        files: ['lib/jquery.center.js', 'src/js/modal.js'],
        tasks: ['jshint', 'uglify']
      },

      karma: {
        files: ['src/*.js', 'test/**/*.js'],
        tasks: ['karma:unit:run']
      }
    }
  });

  grunt.registerTask('default', []);
};