(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){

    var DomReady = window.DomReady = {};

	// Everything that has to do with properly supporting our document ready event. Brought over from the most awesome jQuery. 

    var userAgent = navigator.userAgent.toLowerCase();

    // Figure out what browser is being used
    var browser = {
    	version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
    	safari: /webkit/.test(userAgent),
    	opera: /opera/.test(userAgent),
    	msie: (/msie/.test(userAgent)) && (!/opera/.test( userAgent )),
    	mozilla: (/mozilla/.test(userAgent)) && (!/(compatible|webkit)/.test(userAgent))
    };    

	var readyBound = false;	
	var isReady = false;
	var readyList = [];

	// Handle when the DOM is ready
	function domReady() {
		// Make sure that the DOM is not already loaded
		if(!isReady) {
			// Remember that the DOM is ready
			isReady = true;
        
	        if(readyList) {
	            for(var fn = 0; fn < readyList.length; fn++) {
	                readyList[fn].call(window, []);
	            }
            
	            readyList = [];
	        }
		}
	};

	// From Simon Willison. A safe way to fire onload w/o screwing up everyone else.
	function addLoadEvent(func) {
	  var oldonload = window.onload;
	  if (typeof window.onload != 'function') {
	    window.onload = func;
	  } else {
	    window.onload = function() {
	      if (oldonload) {
	        oldonload();
	      }
	      func();
	    }
	  }
	};

	// does the heavy work of working through the browsers idiosyncracies (let's call them that) to hook onload.
	function bindReady() {
		if(readyBound) {
		    return;
	    }
	
		readyBound = true;

		// Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
		if (document.addEventListener && !browser.opera) {
			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", domReady, false);
		}

		// If IE is used and is not in a frame
		// Continually check to see if the document is ready
		if (browser.msie && window == top) (function(){
			if (isReady) return;
			try {
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left");
			} catch(error) {
				setTimeout(arguments.callee, 0);
				return;
			}
			// and execute any waiting functions
		    domReady();
		})();

		if(browser.opera) {
			document.addEventListener( "DOMContentLoaded", function () {
				if (isReady) return;
				for (var i = 0; i < document.styleSheets.length; i++)
					if (document.styleSheets[i].disabled) {
						setTimeout( arguments.callee, 0 );
						return;
					}
				// and execute any waiting functions
	            domReady();
			}, false);
		}

		if(browser.safari) {
		    var numStyles;
			(function(){
				if (isReady) return;
				if (document.readyState != "loaded" && document.readyState != "complete") {
					setTimeout( arguments.callee, 0 );
					return;
				}
				if (numStyles === undefined) {
	                var links = document.getElementsByTagName("link");
	                for (var i=0; i < links.length; i++) {
	                	if(links[i].getAttribute('rel') == 'stylesheet') {
	                	    numStyles++;
	                	}
	                }
	                var styles = document.getElementsByTagName("style");
	                numStyles += styles.length;
				}
				if (document.styleSheets.length != numStyles) {
					setTimeout( arguments.callee, 0 );
					return;
				}
			
				// and execute any waiting functions
				domReady();
			})();
		}

		// A fallback to window.onload, that will always work
	    addLoadEvent(domReady);
	};

	// This is the public function that people can use to hook up ready.
	DomReady.ready = function(fn, args) {
		// Attach the listeners
		bindReady();
    
		// If the DOM is already ready
		if (isReady) {
			// Execute the function immediately
			fn.call(window, []);
	    } else {
			// Add the function to the wait list
	        readyList.push( function() { return fn.call(window, []); } );
	    }
	};
    
	bindReady();
	
})();
},{}],2:[function(require,module,exports){
require("./libs/domready");
var Parser = require('./modules/parser');

DomReady.ready(function() {
  var parser = new Parser();
  parser.init();
});
},{"./libs/domready":1,"./modules/parser":5}],3:[function(require,module,exports){
function Compare(){
  this._bookmarks = [];
  this._differentBookmarks = {};
}

Compare.prototype.compare = function(bookmarks){
  this._differentBookmarks = {};
  this._bookmarks = bookmarks || [];
  
  this._bookmarks.forEach(function(book, index){
    this._findDifference([], book, index, book);
  }.bind(this));

  return this._differentBookmarks;
};

Compare.prototype._findDifference = function(breadcrumbs, book, index, original){
  for (var name in book) {
    if (name === 'links') {
      this._findDifferentLinks(breadcrumbs, book, index, original);
    } else if (name === 'data') {
      //this._addDifferentFolder(breadcrumbs, book.data);
    } else {
      this._findDifference(breadcrumbs.concat([name]), book[name], index, original);
    }
  }
};

Compare.prototype._findDifferentLinks = function(breadcrumbs, book, index, original){
  if (book.links.length > 0) {
    var links = [];
    this._bookmarks.forEach(function(bookOther, indexBook){
      if (indexBook !== index) {
        links = links.concat(this._findDifferentLinksForPath(breadcrumbs, book, bookOther));
      }
    }.bind(this));
    
    if (links.length) {
      this._addDifferentLinks(breadcrumbs, links, original);
    }
  }
};

Compare.prototype._findDifferentLinksForPath = function(breadcrumbs, book, bookOther){
  var diff = [],
      folder = this._getFolder(breadcrumbs, bookOther);
  
  if (folder.isNew) {
    diff = book.links;
  } else {
    diff = this._findNewLinks(folder.body, book);
  }
  
  return diff;
};

Compare.prototype._getFolder = function(breadcrumbs, book){
  var folder = {
        body: book,
        isNew: false
      };
  
  breadcrumbs.forEach(function(crumb){
    if (folder.body[crumb]) {
      folder.body = folder.body[crumb];
    } else {
      folder.isNew = true;
    }
  });
  
  return folder;
};

Compare.prototype._findNewLinks = function(folder, book){
  var diff = [];
  if (!folder.links.length) return diff;

  book.links.forEach(function(val){
    if (this._isNewLink(folder, val.url)) {
      diff.push(val);
    }
  }.bind(this));
  
  return diff;
};

Compare.prototype._isNewLink = function(folder, url){
  var have = true;
    
  folder.links.forEach(function(valLevel){
    if (valLevel.url === url) {
      have = false;
    }
  });
  
  return have;
};

Compare.prototype._addDifferentFolder = function(breadcrumbs, data){
  var folder = this._differentBookmarks;
  breadcrumbs.forEach(function(val){
    folder[val] = folder[val] || { links: [], data: {} };
    folder = folder[val];
  });
  folder.data = data;
};

Compare.prototype._addDifferentLinks = function(breadcrumbs, links, original){
  var folder = this._differentBookmarks,
      folderOriginal = original;
  
  breadcrumbs.forEach(function(val){
    folder[val] = folder[val] || { links: [], data: this._cloneData(folderOriginal[val].data) };
    
    folder = folder[val];
    folderOriginal = folderOriginal[val];
  }.bind(this));
  folder.links = folder.links.concat(links);
};

Compare.prototype._cloneData = function(data){
  var newData = {};
  for (var name in data) {
    newData[name] = data[name];
  }
  
  return newData;
};

module.exports = Compare;
},{}],4:[function(require,module,exports){
function JsonToString() {
  this.CONST = {
    TAB_SIZE: 4
  };
  this._string = [];
}

JsonToString.prototype.parse = function(data){
  data = data || {};
  this._resetOutString();
  this._jsonToString('', data.json, 0);
  return !!data.returnArray ? this._string : this.toText(this._string);
};

JsonToString.prototype.toText = function(lines){
  lines = lines || [];
  return lines.length ? lines.join('\n') : '';
};

JsonToString.prototype._resetOutString = function(){
  this._string = [];
};

JsonToString.prototype._jsonToString = function(title, json, left){
  if (!json) return;
  
  var offset = this._calcOffset(left),
      linksOffset = offset + this._calcOffset(1);
  
  if (title) {
    this._addTitleFromJson(title, offset, json.data);
    left++;
  }

  this._addLinksFromJson(linksOffset, json.links);
  this._addNextLevelFromJson(json, left);
  this._closeTitleFromJson(title, offset);
};

JsonToString.prototype._calcOffset = function(left){
  left = +left || 0;
  return (new Array((left * this.CONST.TAB_SIZE) + 1)).join(' ');
};

JsonToString.prototype._addTitleFromJson = function(title, offset, data){
  var isRoot = (title === 'Bookmarks');

  this._string.push(offset + (isRoot ? '<H1>' : '<DT><H3' + (data.added ? ' ADD_DATE="' + data.added + '"' : '') + (data.modify ? ' LAST_MODIFIED="' + data.modify + '"' : '') + (data.personal ? ' PERSONAL_TOOLBAR_FOLDER="' + data.personal + '"' : '') + '>') + title + (isRoot ? '</H1>' : '</H3>'));
  this._string.push(offset + '<DL><p>');
};

JsonToString.prototype._addLinksFromJson = function(offset, links){
  if (!links) return;
  
  links.forEach(function(link){
    this._string.push(offset + '<DT><A HREF="' + link.url + '" ADD_DATE="' + link.added + '" ICON="' + link.icon + '">' + link.title + '</A>');
  }.bind(this));
};

JsonToString.prototype._addNextLevelFromJson = function(json, left){
  if (!json) return;
  
  var nextLevel;
  
  for(var title in json) {
    if (title !== 'links' && title !== 'data') {
      nextLevel = this._jsonToString(title, json[title], left);
      if (nextLevel) {
        this._string.push(nextLevel);
      }
    }
  }
};

JsonToString.prototype._closeTitleFromJson = function(title, offset){
  if (!title) return;

  this._string.push(offset + '</DL><p>');
};

module.exports = JsonToString;
},{}],5:[function(require,module,exports){
var Compare = require("./compare"),
    JsonToString = require("./json_to_string"),
    compare = new Compare(),
    jsonToString = new JsonToString();
  
function Parser() {
  this.DEFAULTS = {
    ID: 'bookmarksFiles'
  };
  
  this._options = {
    id: '',
    container: ''
  };
  
  this._input = null;
  this._downloadLink = null;
  this._files = [];
  this._bookmarks = [];
  this._newFile = {
    head: [],
    body: ''
  };
  this._fileBody = {};
  this._folderLevel = {};
  this._breadcrumbs = [];
}

Parser.prototype.init = function(opt_options){
  this._setOptions(opt_options || {});
  this._attachInput();
};

Parser.prototype.onInputChange = function(){
  var reader;
  
  this._hideDownloadLink();    
  this._bookmarks = [];
  this._files = this._input.files;
  this._newFile.head =  [];
  this._newFile.body =  '';
  
  for (var i = 0, len = this._files.length; i < len; i++){
    reader = new FileReader();
    reader.addEventListener('load', this._readFile.bind(this), false);
    reader.readAsText(this._files[i]);
  }
};

Parser.prototype._setOptions = function(options){
  this._options = {
    id: options.id || '',
    container: options.container || ''
  };
};

Parser.prototype._attachInput = function(){
  this._input = this._findInput();
  if (!this._input) this._input = this._createInput();

  this._input.addEventListener(
    'change',
    this.onInputChange.bind(this),
    false
  );
};

Parser.prototype._findInput = function(){
  var input = null;
  
  if (this._options.id) input = document.getElementById(this._options.id);
  if (input && (input.tagName.toLowerCase() !== 'input' || input.type !== 'file')) {
    input = null;
  }
  
  return input;
};

Parser.prototype._createInput = function(){
  var input = document.createElement('input');
  input.id = this._options.id || this.DEFAULTS.ID;
  input.type = 'file';
  input.setAttribute('multiple', '');
  document.body.appendChild(input);
  return input;
};

Parser.prototype._readFile = function(event){
  var content = event.target.result.split("\n"),
      parseLine = this._parseLine.bind(this);

  this._breadcrumbs = [];
  this._fileBody = {};
  this._folderLevel = this._fileBody;
  
  content.forEach(parseLine);
  this._bookmarks.push(this._fileBody);
  
  this._compareAfterFinish();
};

Parser.prototype._parseLine = function(line){
  line = line.trim();
  
  if (line.indexOf('<DT><H3') === 0 || line.indexOf('<H1') === 0) {
    this._addTitle(line);
  } else if (line.indexOf('<DL>') === 0) {
    this._addFolder(line);
  } else if (line.indexOf('<DT><A') === 0) {
    this._addLink(line);
  } else if (line.indexOf('</DL>') === 0) {
    this._closeFolder();
  } else {
    this._addToHead(line);
  }
};

Parser.prototype._addToHead = function(line){
  if (this._bookmarks.length === 1) this._newFile.head.push(line);
};

Parser.prototype._addTitle = function(line){
  var matches = {
    title: line.match(/>([^<^>]+)<\//),
    added: line.match(/ADD_DATE="([^"]*)"/),
    modify: line.match(/LAST_MODIFIED="([^"]*)"/),
    personal: line.match(/PERSONAL_TOOLBAR_FOLDER="([^"]*)"/)
  };
  
  this._breadcrumbs.push({
    title: matches.title ? matches.title[1] : '',
    added: matches.added ? matches.added[1] : '',
    modify: matches.modify ? matches.modify[1] : '',
    personal: matches.personal ? matches.personal[1] : ''
  });
};

Parser.prototype._addFolder = function(line){
  this._folderLevel = this._fileBody;
  
  this._breadcrumbs.forEach(function(data){
    this._folderLevel[data.title] = this._folderLevel[data.title] || {
      links: [],
      data: {
        added: data.added,
        modify: data.modify,
        personal: data.personal
      }
    };
    this._folderLevel = this._folderLevel[data.title];
  }.bind(this));
};

Parser.prototype._addLink = function(line){
  var matches = {
    title: line.match(/>([^<^>]+)<\//),
    url: line.match(/HREF="([^"]*)"/),
    added: line.match(/ADD_DATE="([^"]*)"/),
    icon: line.match(/ICON="([^"]*)"/)
  };
  
  this._folderLevel.links.push({
    title: matches.title ? matches.title[1] : '',
    url: matches.url ? matches.url[1] : '',
    added: matches.added ? matches.added[1] : '',
    icon: matches.icon ? matches.icon[1] : ''
  });
};

Parser.prototype._closeFolder = function(){
  this._breadcrumbs.pop();
};

Parser.prototype._compareAfterFinish = function(){
  if (this._bookmarks.length === this._files.length) {
    var differentBookmarks = compare.compare(this._bookmarks);
    
    this._newFile.body = jsonToString.parse({
      json: differentBookmarks
    });
    
    if (!this._newFile.body) {
      alert('Not found different bookmarks');
    } else {
      this._downloadFile();
    }
    
    this._input.value = '';
  }
};

Parser.prototype._arrayToString = function(array){
  return array.join('\n');
};

Parser.prototype._downloadFile = function(){
  this._updateInput();
  this._showDownloadLink();
};

Parser.prototype._updateInput = function(){
  this._createDownloadLink();
  this._textToUrl();
};

Parser.prototype._textToUrl = function(){
  var blobText = new Blob([
        jsonToString.toText(this._newFile.head) +
        this._newFile.body
      ]),
      url = URL.createObjectURL(blobText);
      
  this._downloadLink.href = url;
};

Parser.prototype._createDownloadLink = function(){
  if (this._downloadLink) return;
  
  this._downloadLink = document.createElement('a');
  this._downloadLink.textContent = 'download';
  this._downloadLink.download = 'new_bookmarks.html';
  document.body.appendChild(this._downloadLink);
};

Parser.prototype._showDownloadLink = function(){
  if (!this._downloadLink) return;
  
  this._downloadLink.classList.remove('hidden');
};

Parser.prototype._hideDownloadLink = function(){
  if (!this._downloadLink) return;
  
  this._downloadLink.classList.add('hidden');
};
  
module.exports = Parser;
},{"./compare":3,"./json_to_string":4}]},{},[2]);
