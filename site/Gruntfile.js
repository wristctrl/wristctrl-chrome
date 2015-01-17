module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                files: {
                    'public/stylesheets/bootstrap.css': 'public/bootstrap/stylesheets/bootstrap.scss',
                    'public/stylesheets/base.css': 'sass/base.scss'
                }
            }
        },
        autoprefixer: {
            single_file: {
                src: 'public/stylesheets/base.css',
                dest: 'public/stylesheets/base.css'
            }
        },
        watch: {
            source: {
                files: ['./**/*.scss'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    livereload: true, // needed to run LiveReload
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-livereload');
    grunt.loadNpmTasks('grunt-autoprefixer');

    grunt.registerTask('default', ['sass', 'autoprefixer']);
};