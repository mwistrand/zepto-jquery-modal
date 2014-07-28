module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files
    // if you set it to current dir like here, all your other paths can just be relative to it
    basePath: ".",

    frameworks: ["jasmine"],

    // list of files / patterns to load in the browser
    files: [
      // serve html and json fixtures
      { pattern: "test/fixtures/*.html", watched: true, served: true, included: false },
      { pattern: "test/fixtures/json/*.json", watched: true, served: true, included: false },

      // dependencies
      "bower_components/jquery/dist/jquery.min.js",
      "bower_components/underscore/underscore.js",
      "bower_components/backbone/backbone.js",
      "bower_components/handlebars/handlebars.min.js",
      "bower_components/cssdetect/jquery.cssDetect.js",
      "bower_components/utilities/u$.js",

      // test helper code
      "test/helpers/jasmine-jquery.js",

      // set jasmine fixtures path
      // includes only this line: jasmine.getFixtures().fixturesPath = "base/test/fixtures/";
      "test/helpers/fixtures.js",

      // code you want to test
      "src/js/u$.modal.js",

      // test code
      "test/spec/*.js"
    ],

    // list of files to exclude
    exclude: [],
    preprocessors: {"*/.html": [] },

    // test results reporter to use
    // possible values: "dots", "progress", "junit"
    reporters: ["progress"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ["Chrome"],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 20000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher"
    ]
  });
};
