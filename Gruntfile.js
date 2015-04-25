'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        nodemon:   {
            dev:  {
                script:  'app.js',
                options: {
                    nodeArgs:  ['--harmony'],
                    env:       {
                        NODE_ENV: 'development',
                        port: '3000'
                    },
                    cwd:       '.',
                    delayTime: 1
                }
            },
            prod: {
                script:  'app.js',
                options: {
                    nodeArgs:  ['--harmony'],
                    env:       {
                        NODE_ENV: 'production'
                    },
                    cwd:       '.',
                    delayTime: 1
                }
            }
        },
        watch:     {
            options: {
                nospawn: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon']);
    grunt.registerTask('prod', ['nodemon:prod']);

};
