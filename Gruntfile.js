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
        keepSpecialComments: 0,
        rebase: true,
        relativeTo: './index.html',
        target: 'styles/libs.min.css'
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
      },
      debug: {
        src: ['scripts/main.min.js'],
        actions: [
          {
            name: 'main',
            search: 'window.DEBUG=!0',
            replace: 'window.DEBUG=0',
            flags: 'g'
          }
        ]
      }
    },

    'compress': {
      main: {
        options: {
          archive: 'trademap.zip'
        },
        files: [
          {src: ['data/*'], dest: './', filter: 'isFile'}, // includes files in path
          {src: ['img/**', 'pages/**', 'styles/**', 'scripts/**'], dest: './'}, // includes files in path and its subdirs
          {src: ['./*.txt', './*.html', './*.md', './*.php'], dest: './', filter: 'isFile'}
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
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task(s).
  grunt.registerTask('default', [
    'copy:indexFile',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'requirejs:compile',
    'regex-replace:debug',
    'regex-replace:dist',
    'compress'
  ]);

};
