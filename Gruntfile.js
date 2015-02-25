"use strict";

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            src: ['**/*.js', '!node_modules/**/*.*'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        mochaTest: {
            test: {
                src: ['app/test/**/Test*.js'],
                options: {
                    reporter: 'spec'
                }
            },
            it: {
                src: ['app/it/**/Test*.js'],
                options: {
                    reporter: 'spec'
                }
            }
        },
        watch: {
            js: {
                files: ['**/*.js', '!**/node_modules/**'],
                tasks: ['lint', 'test']
            }
        },
        express: {
            dev: {
                options: {
                    script: './dev-server.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    grunt.registerTask('start', ['express:dev', 'watch']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['mochaTest:test']);
    grunt.registerTask('it', ['mochaTest:it']);
    grunt.registerTask('default', ['lint', 'test', 'it']);

};
