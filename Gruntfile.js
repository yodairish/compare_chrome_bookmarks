module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      'build/bookmarks.js': ['js/main.js']
    },
    jest: {
      options: {
        coverage: true,
        testPathPattern: /.*-test.js/
      }
    },
    'closure-compiler': {
      frontend: {
        closurePath: 'closure-compiler',
        js: 'build/bookmarks.js',
        jsOutputFile: 'build/bookmarks.min.js',
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
        },
        noreport: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-jest');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-closure-compiler');

  grunt.registerTask('build', ['browserify', 'closure-compiler']);
  grunt.registerTask('test', ['jest']);
  grunt.registerTask('default', ['build']);
};