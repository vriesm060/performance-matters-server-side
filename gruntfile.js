module.exports = function (grunt) {

grunt.initConfig({
  critical: {
    dist: {
      options: {
        base: './'
      },
      // The source file
      src: '/',
      // The destination file
      dest: 'results.html'
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-critical');

  // Default tasks.
  grunt.registerTask('default', ['critical']);
};
