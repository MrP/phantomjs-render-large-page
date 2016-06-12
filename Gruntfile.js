module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jasmine_nodejs: {
            options: {
                specNameSuffix: "spec.js",
                helperNameSuffix: "helper.js",
            },
            test: {
                options: {},
                specs: [
                    "spec/**",
                ],
                helpers: []
            }
        }
    });

    grunt.registerTask('test', ['jasmine_nodejs']);
    grunt.registerTask('default', ['test']);
};
