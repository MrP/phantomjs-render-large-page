module.exports = function (grunt) {
    function pageName() {
        if (grunt.option('newPage')) {
            return grunt.option('newPage').replace(/\.html$/i,'');
        } else if (grunt.option('originalPage')) {
            return grunt.option('originalPage').replace(/\.html$/i,'') + '-tiled';
        } else {
            return 'page';
        }
    }
    function originalPage() {
        var orig = grunt.option('originalPage');
        if (!/\.html$/i.test(orig)) {
            orig += '.html';
        }
        return orig;
    }
    function filesDir() {
        return pageName() + '-files';
    }

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pageName: pageName(),
        filesDir: filesDir(),
        'http-server': {
            test: {
                root: 'spec/test-pages/',
                port: process.env.PORT || '8080',
                host: process.env.IP || '0.0.0.0',
                runInBackground: true
            },
            dev: {
                root: 'spec/test-pages/',
                port: process.env.PORT || '8080',
                host: process.env.IP || '0.0.0.0',
                runInBackground: false
            }
        },
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

    grunt.registerTask('build', function () {
        // grunt.task.run(['']);
    });

    grunt.registerTask('test', function () {
        // grunt.task.run(['']);
    });

    grunt.registerTask('test', ['jasmine_nodejs']);
    grunt.registerTask('server', ['http-server:dev']);
    grunt.registerTask('default', ['tile', 'build', 'server']);
};
