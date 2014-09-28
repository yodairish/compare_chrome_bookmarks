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
    body: []
  };
  this._fileBody = {};
  this._folderLevel = {};
  this._breadcrumbs = [];
}

Parser.prototype.init = function(opt_options){
  this._setOptions(opt_options || {});
  this._attachInput();
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
    this._onInputChange.bind(this),
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

Parser.prototype._onInputChange = function(){
  var reader;
  
  this._hideDownloadLink();    
  this._bookmarks = [];
  this._files = this._input.files;
  this._newFile.head =  [];
  this._newFile.body =  [];
  
  for (var i = 0, len = this._files.length; i < len; i++){
    reader = new FileReader();
    reader.addEventListener('load', this._readFile.bind(this), false);
    reader.readAsText(this._files[i]);
  }
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
    
    this._newFile.body = jsonToString.parse(differentBookmarks, true);
    
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
        this._arrayToString(this._newFile.head) +
        this._arrayToString(this._newFile.body)
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