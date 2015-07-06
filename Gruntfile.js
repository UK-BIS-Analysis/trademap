module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    copy: {
      indexFile: {
        src: 'index.dev.html',
        dest: 'index.html'
      },
      modernizr: {
        src: 'libs/modernizr.custom.js',
        dest: 'assets/modernizr.custom.js'
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
        target: 'assets/libs.min.css'
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
          out: 'assets/main.min.js',
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
            search: '<script data-main="scripts/main" src="libs/requirejs/require.js"></script>',
            replace:'<script src="assets/main.min.js?build=' + (new Date()).getTime() + '"></script>',
            flags: 'g'
          }
        ]
      },
      debug: {
        src: ['assets/main.min.js'],
        actions: [
          {
            name: 'main',
            search: 'window.DEBUG=!0',
            replace: 'window.DEBUG=0',
            flags: 'g'
          }
        ]
      },
      modernizr: {
        src: ['index.html'],
        actions: [
          {
            name: 'main',
            search:  '<script type="text/javascript" src="libs/modernizr.custom.js"></script>',
            replace: '<script type="text/javascript" src="assets/modernizr.custom.js"></script>',
            flags: 'g'
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'index.html': 'index.html',     // 'destination': 'source'
        }
      }
    },

    'compress': {
      main: {
        options: {
          archive: 'trademap.zip'
        },
        files: [
          {src: ['data/*'], dest: './', filter: 'isFile'}, // includes files in path
          {src: ['img/**', 'pages/**', 'assets/**', 'libs/**', 'styles/**', 'scripts/**'], dest: './'}, // includes files in path and its subdirs
          {src: ['./*.txt', './*.html', './*.md', './*.ico', '!./passwords.md'], dest: './', filter: 'isFile'}
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
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // Default task(s).
  grunt.registerTask('default', [
    'copy:indexFile',
    'copy:modernizr',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'requirejs:compile',
    'regex-replace:debug',
    'regex-replace:dist',
    'regex-replace:modernizr',
    'htmlmin:dist',
    'compress'
  ]);

};
