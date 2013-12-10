'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var AssemblyGenerator = module.exports = function AssemblyGenerator(args, options, config) {
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

  var prompts = [{
    name: 'projectName',
    message: 'What is the name of this project?',
    default: this.projectName
  }, { 
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'RequireJS',
      value: 'includeRequireJS',
      checked: true
    }, {
      name: 'Modernizr',
      value: 'includeModernizr',
      checked: true
    }, {
      name: 'Underscore',
      value: 'includeUnderscore',
      checked: true
    }, {
      name: 'Bootstrap',
      value: 'includeBootstrap',
      checked: true
    }]
  }];

  this.prompt(prompts, function (props) {
    this.projectName = props.projectName;

    var features = props.features;
    function hasFeature(feat) { return features.indexOf(feat) !== -1; }

    this.includeRequireJS = hasFeature('includeRequireJS');
    this.includeModernizr = hasFeature('includeModernizr');
    this.includeUnderscore = hasFeature('includeUnderscore');
    this.includeBootstrap = hasFeature('includeBootstrap');

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

  this.template('Gruntfile.js', 'Gruntfile.js');
  this.template('index.html', 'app/index.html');
  
  this.copy('_styles.less', 'app/assets/less/styles.less');  
  this.copy('variables.less', 'app/assets/less/site/variables.less');
  this.copy('mixins.less', 'app/assets/less/site/mixins.less');
  this.copy('global.less', 'app/assets/less/site/global.less');

  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');

  if (this.includeRequireJS) {
    this.copy('_main.js', 'app/assets/js/main.js');
    this.copy('app.js', 'app/assets/js/app.js');
  }

};

AssemblyGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
  this.copy('bowerrc', '.bowerrc');
  this.copy('gitignore', '.gitignore');
};