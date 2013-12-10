'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		watch: {
			css: {
				files: [
					'app/assets/less/*.less',
					'app/assets/less/site/*.less'
				],
				tasks: ['less:development'],
				options: {
					livereload: true,
				}
			},
			js: {
				files: [
					'app/assets/js/*.js',
					'Gruntfile.js'
				],
				tasks: ['jshint'],
				options: {
					livereload: true,
				}
			}
		},
		browser_sync: {
			files: {
				src : [
					'app/assets/css/*.css',
					'app/assets/img/*',
					'app/assets/js/*.js',
					'app/*.html'
				],
			},
			options: {
				watchTask: true
			}
		},
		less: {
			development: {
				options: {
					paths: 'app/assets/css'
				},
				files: {
					'app/assets/css/styles.css': 'app/assets/less/styles.less'
				}
			},
			production: {
				options: {
					paths: 'app/assets/css',
					cleancss: true
				},
				files: {
					'dist/assets/css/styles.css': 'app/assets/less/styles.less'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: ['Gruntfile.js', 'app/assets/js/*.js']
		},
		requirejs: {
			compile: {
				options: {
					mainConfigFile: 'app/assets/js/main.js',
					paths: {
						jquery: 'empty:',
						underscore: 'empty:',
						app: 'app'
					},
					dir: 'dist/assets/js',
					shim: {
						underscore: {
							deps: ['jquery'],
							exports: '_'
						},
						app: {
							deps: ['jquery', 'underscore']
						}
					}
				}
			}
		},
		copy: {
			build: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'app',
					dest: 'dist',
					src: [
						'*.{ico,txt,html}',
						'.htaccess',
						'assets/img/*.{gif,jpg,jpeg,png,svg}',
						'assets/fonts/*',
						'assets/bower_components/jquery/jquery.min.js',
						'assets/bower_components/modernizr/modernizr.js',
						'assets/bower_components/underscore/underscore-min.js',
						'assets/bower_components/requirejs/require.js'
					]
				}]
			}
		},
	});

	// Load the Grunt plugins.
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');

	// Register the default tasks.
	grunt.registerTask('default', ['browser_sync', 'watch']);

	// Register the build tasks.
	grunt.registerTask('build', ['requirejs', 'less:production', 'copy:build']);


};