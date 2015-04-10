module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    copy: {
      indexFile: {
        src: 'index.dev.html',
        dest: 'index.html'
      }
    },

    useminPrepare: {
      html: 'index.dev.html',
      options: {
        dest: './',
        flow: {
          steps: {
            js: ['concat', 'uglifyjs'],
            css: ['cssmin']
          },
          post: {}
        }
      }
    },
    cssmin: {
      options: {
        root: './',
        keepSpecialComments: 0,
        rebase: true,
        relativeTo: './',
        target: './'
      }
    },

    usemin: {
      html: 'index.html'
    }




  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-filerev');

  // Default task(s).
  grunt.registerTask('default', [
    'copy:indexFile',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin'
  ]);

};
