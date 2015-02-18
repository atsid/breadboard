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
                files: ['**/*.js', '!**/node_modules/**'],
                tasks: ['lint', 'test']
            }
        },
        'node-inspector': {
            dev: { 
                "debug-port": 3000
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-node-inspector');

    // start server using debug flag and start node-inspector
    grunt.registerTask('start', 'Start server and node-inspector', function (brk) {
        var node = grunt.util.spawn({
            cmd: 'node',
            args: [brk ? '--debug-brk' : '--debug', 'main.js']
        });
        node.stdout.pipe(process.stdout);
        node.stderr.pipe(process.stderr);

        grunt.task.run('node-inspector:dev');
    });

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('default', ['jshint', 'mochaTest']);

};
