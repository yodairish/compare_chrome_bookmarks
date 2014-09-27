require(['../libs/domReady/domReady','bookmarks-parser'], function(domReady, parser){
  domReady(function(){
    parser.init();
  });
});