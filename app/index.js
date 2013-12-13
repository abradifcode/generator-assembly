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
			type: 'list',
			name: 'preprocessor',
			message: 'Which CSS Preprocessor would you like?',
			choices: [
				{
					name: 'LESS',
					value: 'includeLESS'
				},
				{
					name: 'SASS',
					value: 'includeSASS'
				}
			]
		}, 
		{ 
			type: 'list',
			name: 'framework',
			message: 'Which front-end framework would you like?',
			choices: [
				{
					name: 'Bootstrap',
					value: 'includeBootstrap'
				},
				{
					name: 'Foundation',
					value: 'includeFoundation'
				},
				{
					name: 'None',
					value: 'includeNone'
				}
			]
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
			default: 'signals',
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

		//Preprocessor Questions
		var framework = props.framework;
		function whichframework(frameworkOptions) { return framework.indexOf(frameworkOptions) !== -1; }

		this.includeBootstrap = whichframework('Bootstrap');
		this.includeFoundation = whichframework('Foundation');
		this.includeNone = whichframework('None');

		//Framework Questions
		var preprocessor = props.preprocessor;
		function whichPreprocessor(preprocessorOptions) { return preprocessor.indexOf(preprocessorOptions) !== -1; }

		this.includeLESS = whichPreprocessor('LESS');
		this.includeSASS = whichPreprocessor('SASS');

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

	if (this.includeLESS) {		
		this.mkdir('app/assets/less');
		this.mkdir('app/assets/less/site');
	}

	if (this.includeSASS) {		
		this.mkdir('app/assets/sass');
		this.mkdir('app/assets/sass/site');
	}

	this.mkdir('dist');

	this.template('global/Gruntfile.js', 'Gruntfile.js');

	//No CMS Starting files
	this.template('global/index.html', 'app/index.html');

	this.copy('global/404.html', 'app/404.html');
	this.copy('global/robots.txt', 'app/robots.txt');
	this.copy('global/favicon.ico', 'app/favicon.ico');
	this.copy('global/apple-touch-icon-precomposed.png', 'app/apple-touch-icon-precomposed.png');

	//Starter LESS Setup
	if (this.includeLESS) {
		this.copy('starter-less/_styles.less', 'app/assets/less/styles.less');	
		this.copy('starter-less/variables.less', 'app/assets/less/site/variables.less');
		this.copy('starter-less/mixins.less', 'app/assets/less/site/mixins.less');
		this.copy('starter-less/global.less', 'app/assets/less/site/global.less');
	}

	//Starter SASS Setup
	if (this.includeSASS) {
		this.copy('starter-sass/_styles.scss', 'app/assets/sass/styles.scss');	
		this.copy('starter-sass/variables.scss', 'app/assets/sass/site/variables.scss');
		this.copy('starter-sass/mixins.scss', 'app/assets/sass/site/mixins.scss');
		this.copy('starter-sass/global.scss', 'app/assets/sass/site/global.scss');			
	}

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