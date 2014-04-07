'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var git = require('simple-git')();

module.exports = AssemblyGenerator;

function AssemblyGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	this.on('end', function () {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AssemblyGenerator, yeoman.generators.Base);

AssemblyGenerator.prototype.askFor = function askFor() {
	var cb = this.async();

	// have Yeoman greet the user.
	console.log(this.yeoman);

	// Validate required
	var requiredValidate = function(value) {
		if (value == '') {
			return 'This field is required.';
		}
		return true;
	};

	var prompts = [
		{
			name: 'projectName',
			message: 'What is the name of this project?',
			validate: requiredValidate
		},
		{
			type: 'checkbox',
			name: 'features',
			message: 'jQuery is included by default so what more would you like?',
			choices: [
				{
					name: 'RequireJS',
					value: 'includeRequireJS',
					checked: true
				},
				{
					name: 'Modernizr',
					value: 'includeModernizr',
					checked: true
				},
				{
					name: 'Underscore',
					value: 'includeUnderscore',
					checked: true
				}
			]
		},
		{
			type: 'list',
			name: 'versionControl',
			message: 'Which version control service are you using?',
			choices: [
				{
					name: 'BitBucket',
					value: 'includeBitBucket'
				},
				{
					name: 'Github',
					value: 'includeGitHub'
				}
			]
		},
		{
			name: 'accountName',
			message: 'What is the name of the account?',
			default: 'assemblydigital',
			validate: requiredValidate
		},
		{
			name: 'repoName',
			message: 'What is the name of the repo?',
			validate: requiredValidate
		}
	];

	this.prompt(prompts, function (props) {
		this.projectName = props.projectName;

		//Feature Questions
		var features = props.features;
		function hasFeature(feat) { return features.indexOf(feat) !== -1; }

		this.includeRequireJS = hasFeature('includeRequireJS');
		this.includeModernizr = hasFeature('includeModernizr');
		this.includeUnderscore = hasFeature('includeUnderscore');

		//Feature Questions
		var versionControl = props.versionControl;
		function hasVersionControl(versionOption) { return versionControl.indexOf(versionOption) !== -1; }

		this.includeBitBucket = hasVersionControl('includeBitBucket');
		this.includeGitHub = hasVersionControl('includeGitHub');

		this.accountName = props.accountName;
		this.repoName = props.repoName;

		cb();
	}.bind(this));
};

AssemblyGenerator.prototype.app = function app() {
	this.mkdir('app');
	this.mkdir('app/assets');
	this.mkdir('app/assets/css');
	this.mkdir('app/assets/fonts');
	this.mkdir('app/assets/img');
	this.mkdir('app/assets/js');
	this.mkdir('app/assets/less');
	this.mkdir('app/assets/less/site');

	this.mkdir('dist');

	this.template('global/Gruntfile.js', 'Gruntfile.js');

	this.template('global/index-template.html', 'app/index-template.html');

	this.copy('global/404.html', 'app/404.html');
	this.copy('global/robots.txt', 'app/robots.txt');
	this.copy('global/favicon.ico', 'app/favicon.ico');
	this.copy('global/apple-touch-icon-precomposed.png', 'app/apple-touch-icon-precomposed.png');

	//Starter LESS Setup
	this.copy('starter-less/_styles.less', 'app/assets/less/styles.less');
	this.copy('starter-less/variables.less', 'app/assets/less/site/variables.less');
	this.copy('starter-less/mixins.less', 'app/assets/less/site/mixins.less');
	this.copy('starter-less/global.less', 'app/assets/less/site/global.less');


	this.copy('global/_package.json', 'package.json');
	this.copy('global/_bower.json', 'bower.json');
	this.copy('global/htaccess', '.htaccess');

	if (this.includeRequireJS) {
		this.copy('global/_main.js', 'app/assets/js/main.js');
		this.copy('global/app.js', 'app/assets/js/app.js');
	}
};

AssemblyGenerator.prototype.projectfiles = function projectfiles() {
	this.copy('global/editorconfig', '.editorconfig');
	this.copy('global/jshintrc', '.jshintrc');
	this.copy('global/bowerrc', '.bowerrc');
	this.copy('global/gitignore', '.gitignore');
};

// Git setup
AssemblyGenerator.prototype.initGit = function initGit() {
	var cb = this.async();

	if (this.includeBitBucket) {
		var accountName = this.accountName;
		var repoName = this.repoName;
		var repoURL = 'https://bitbucket.org/'+ accountName +'/'+ repoName +'.git';
	}

	if (this.includeGitHub) {
		var accountName = this.accountName;
		var repoName = this.repoName;
		var repoURL = 'https://github.com/'+ accountName +'/'+ repoName +'.git';
	}

	console.log('Initializing Git');

	git.init(function(err) {

		if (err) console.log(err);
		console.log('Git init complete');

		git.add('--all', function(err) {

			if (err) console.log(err);

		}).addRemote('origin', repoURL)
		.commit('Initial Commit', function(err, d) {

			if (err) console.log(err);
			console.log('Git add and commit complete: ' + JSON.stringify(d, null, '  '));

		})
		.push('origin', 'master');

		cb();
	});
};