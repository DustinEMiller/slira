module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        html2js: {
            dist: {
                src: [ 'client/js/*.html', 'client/js/**/*.html' ],
                dest: 'tmp/templates.js'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [ 'client/js/*.js', 'client/js/**/*.js', 'tmp/*.js' ],
                dest: 'public/js/app.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'public/js/app.js': [ 'public/js/app.js' ]
                },
                options: {
                    mangle: false
                }
            }
        },
        clean: {
            temp: {
                src: [ 'tmp' ]
            }
        },
        watch: {
            dev:{
                files: [ 'Gruntfile.js', 'client/js/*.js', 'client/js/**/*.js'],
                tasks: [ 'html2js:dist', 'concat:dist', 'clean:temp'],
                options: {
                    atBegin: true
                }    
            },
            min: {
                files: [ 'Gruntfile.js', 'client/js/*.js', 'client/js/**/*.js'],
                tasks: [ 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist'],
                options: {
                    atBegin: true
                }
            }
        }
        
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dev', [ 'watch:dev' ]);
    grunt.registerTask('minified', [ 'watch:min' ]);
};