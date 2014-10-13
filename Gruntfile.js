module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        }
    });


    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['less']);
}
