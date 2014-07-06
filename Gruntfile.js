module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      app: {
        src: ['public/client/app.js', 'public/client/link.js', 'public/client/links.js', 'public/client/linkView.js', 'public/client/linksView.js', 'public/client/createLinkView.js', 'public/client/router.js'],
        dest: 'public/dist/mainApp.js'
      },
      depd: {
        src: ['public/lib/jquery.js', 'public/lib/underscore.js', 'public/lib/.js', 'public/lib/backbone.js', 'public/lib/handlebars.js'],
        dest: 'public/dist/mainDepd.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/mainApp.min.js': ['public/dist/mainApp.js'],
          'public/dist/mainDepd.min.js': ['public/dist/mainDepd.js']
        }
      }
    },

    jshint: {
      files: {
        src: ['public/client/*.js']
      },
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      combine: {
        files: {
          'public/dist/style.min.css': ['public/style.css']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push azure master'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function(target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
      cmd: 'grunt',
      grunt: true,
      args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run(['watch']);
  });
 grunt.registerTask('server-prod', ['shell:prodServer']);

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', ['jshint', 'test', 'concat', 'uglify', 'cssmin']);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run(['server-prod']);

    } else {
      grunt.task.run(['server-dev']);
    }
  });

  grunt.registerTask('deploy', [
    'build', 'upload'
  ]);

};