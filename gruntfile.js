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
          'src/modal.min.js': ['src/modal.js']
        }
      }
    },

    watch: {
      js: {
        files: 'src/modal.js',
        tasks: ['uglify']
      },

      karma: {
        files: ['src/*.js', 'test/**/*.js'],
        tasks: ['karma:unit:run']
      }
    }
  });

  grunt.registerTask('default', []);
};