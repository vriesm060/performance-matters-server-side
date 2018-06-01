'use strict';

// Required JS files:
var checkStatus = require('./checkStatus.js');
var search = require('./search.js');
var timeline = require('./timeline.js');

(function () {

  var app = {
    init: function () {
      checkStatus.init();
      search.init(streets);
      timeline.init();
    }
  };

  app.init();

}) ();
