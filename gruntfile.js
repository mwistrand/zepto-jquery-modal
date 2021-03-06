module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        files: {
          'u$.modal.js': 'src/js/u$.modal.js'
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
        files: 'src/js/modal.js',
        tasks: ['jshint', 'uglify']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'uglify']);
};