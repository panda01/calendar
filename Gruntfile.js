module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        less: {
            development: {
                options: {
                    dumpLineNumbers: 'all',
                    // rootPath: 'css',
                    paths: ['css/less']
                },
                files: {
                    "css/calendar.css": "css/less/calendar.less"
                }
            },
            prod: {
                files: {
                    'dist/calendar.css': 'css/less/calendar.less'
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                maxparams: 3,
                strict: true,
                unused: true,
                immed: true,
                latedef: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                globals: {
                    window: true,
                    moment: true,
                    document: true
                },
                // suppress warnings about mixed spaces and tabs
                '-W099': true,
                // supress warnings about Constructors not starting with Capitals
                '-W055': true
            },
            files: ['js/**/*.js']
        },
        watch: {
            less: {
                files: 'css/**/*.less',
                tasks: 'less:development',
                options: {
                    atBegin: true
                }
            },
            scripts: {
                files: 'js/**/*.js',
                tasks: 'jshint:files',
                options: {
                    atBegin: true
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less', 'jshint']);
};
