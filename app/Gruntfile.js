"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            src: ['**/*.js', '!client/**/*.*', "!client2/**/*.*", '!node_modules/**/*.*'],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('lint', ['jshint']);

};