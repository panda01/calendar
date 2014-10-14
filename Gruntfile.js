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
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['less']);
};
