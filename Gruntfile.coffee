module.exports = (grunt) ->
  "use strict"

  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-uglify"

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    jshint:
      options:
        eqeqeq: true
        eqnull: true
        browser: true
        strict: true
        unused: false
        quotmark: "single"

      files:
        src: [
          "src/jquery.html5Loader.js"
          "animations/*.js"
          "Gruntfile.js"
        ]


    uglify:
      options:
        banner: "/*! <%= pkg.name %> v<%= pkg.version %> || <%= pkg.author %> */\n"

      build:
        src: "src/jquery.html5Loader.js"
        dest: "src/jquery.html5Loader.min.js"


  # test js files
  grunt.registerTask "test", [
    "jshint"
  ]

  # Default task.
  grunt.registerTask "default", [
    "jshint"
    "uglify"
  ]
  return