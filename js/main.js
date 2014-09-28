require("./libs/domready");
var Parser = require('./modules/parser');

DomReady.ready(function() {
  var parser = new Parser();
  parser.init();
});