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
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: "scripts",
          name: "../node_modules/almond/almond",
          include: ['main'],
          insertRequire: ['main'],
          out: 'scripts/main.min.js',
          optimize: "uglify2"
        }
      }
    },

    'regex-replace': {
      dist: {
        src: ['index.html'],
        actions: [
          {
            name: 'main',
            search: '<script data-main=".*" src="scripts/libs/requirejs/require.js"></script>',
            replace: function(match){
              var regex = /scripts\/.*main/;
              var result = regex.exec(match);
              return '<script src="' + result[0] + '.min.js"></script>';
            },
            flags: 'g'
          }
        ]
      }
    }


  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-regex-replace');

  // Default task(s).
  grunt.registerTask('default', [
    'copy:indexFile',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'requirejs:compile',
    'regex-replace:dist'
  ]);

};
