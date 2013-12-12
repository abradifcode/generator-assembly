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

  var prompts = [
    {
      name: 'projectName',
      message: 'What is the name of this project?',
      default: this.projectName
    }, 
    { 
      type: 'list',
      name: 'cms',
      message: 'Which CMS would you like to use?',
      choices: [
        {
          name: 'WordPress',
          value: 'includeWordPress'
        },{
          name: 'None',
          value: 'includeNoCMS'
        },{
          name: 'Drupal',
          value: 'includeDrupal'
        }
      ]
    }, 
    { 
      type: 'list',
      name: 'preprocessor',
      message: 'Which CSS Preprocessor would you like?',
      choices: [
        {
          name: 'LESS',
          value: 'includeLESS'
        }, {
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
        }, {
          name: 'Foundation',
          value: 'includeFoundation'
        }, {
          name: 'None',
          value: 'includeNone'
        }
      ]
    },
    { 
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
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
    }
  ];

  this.prompt(prompts, function (props) {
    this.projectName = props.projectName;

    //CMS Question
    var cms = props.cms;
    function whichCMS(cmsOptions) { return cms.indexOf(cmsOptions) !== -1; }

    this.includeWordPress = whichCMS('includeWordPress');
    this.includeNoCMS = whichCMS('includeNoCMS');
    this.includeDrupal = whichCMS('includeDrupal');

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

    cb();
  }.bind(this));
};

AssemblyGenerator.prototype.app = function app() {
  if (this.includeNoCMS) {

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

    this.template('Gruntfile.js', 'Gruntfile.js');

    //No CMS Starting files
    this.template('nocms/index.html', 'app/index.html');

    this.copy('nocms/404.html', 'app/404.html');
    this.copy('nocms/robots.txt', 'app/robots.txt');
    this.copy('nocms/favicon.ico', 'app/favicon.ico');
    this.copy('nocms/apple-touch-icon-precomposed.png', 'app/apple-touch-icon-precomposed.png');

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
      this.copy('requirejs/_main.js', 'app/assets/js/main.js');
      this.copy('global/app.js', 'app/assets/js/app.js');
    }
  }
};

AssemblyGenerator.prototype.projectfiles = function projectfiles() {
  if (this.includeNoCMS) {
    this.copy('global/editorconfig', '.editorconfig');
    this.copy('global/jshintrc', '.jshintrc');
    this.copy('global/bowerrc', '.bowerrc');
    this.copy('global/gitignore', '.gitignore');
  }
};