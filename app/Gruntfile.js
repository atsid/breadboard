"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            src: ['**/*.js', '!client/**/*.*', '!node_modules/**/*.*'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        mochaTest: {
            test: {
                src: ['test/**/*.js', 'it/**/*.js'],
                options: {
                    reporter: 'spec'
                }
            }
        },
        watch: {
            js: {
                files: '**/*.js',
                tasks: ['lint', 'test']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('default', ['jshint', 'mochaTest']);

};
