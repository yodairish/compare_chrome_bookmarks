require.config({
  baseUrl: "js"
});

require(['libs/domReady','modules/parser'], function(domReady, parser){
  domReady(function(){
    parser.init();
  });
});