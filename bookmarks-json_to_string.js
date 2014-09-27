define(function(){
  function BookmarksJsonToString() {
    this.CONST = {
      TAB_SIZE: 4
    };
    this._string = [];
  }
  
  BookmarksJsonToString.prototype.parse = function(json, opt_needArray){
    this._string = [];
    this._jsonToString('', json, 0);
    return !!opt_needArray ? this._string : this._getString();
  };
  
  BookmarksJsonToString.prototype._jsonToString = function(title, json, left){
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
  
  BookmarksJsonToString.prototype._calcOffset = function(left){
    return (new Array((left * this.CONST.TAB_SIZE) + 1)).join(' ');
  };
  
  BookmarksJsonToString.prototype._addTitleFromJson = function(title, offset, data){
    var isRoot = (title === 'Bookmarks');

    this._string.push(offset + (isRoot ? '<H1>' : '<DT><H3' + (data.added ? ' ADD_DATE="' + data.added + '"' : '') + (data.modify ? ' LAST_MODIFIED="' + data.modify + '"' : '') + (data.personal ? ' PERSONAL_TOOLBAR_FOLDER="' + data.personal + '"' : '') + '>') + title + (isRoot ? '</H1>' : '/<H3>'));
    this._string.push(offset + '<DL><p>');
  };
  
  BookmarksJsonToString.prototype._addLinksFromJson = function(offset, links){
    if (!links) return;
    
    links.forEach(function(link){
      this._string.push(offset + '<DT><A HREF="' + link.url + '" ADD_DATE="' + link.added + '" ICON="' + link.icon + '">' + link.title + '</A>');
    }.bind(this));
  };
  
  BookmarksJsonToString.prototype._addNextLevelFromJson = function(json, left){
    if (!json || this._a < 0) return;

    for(var title in json) {
      if (title !== 'links' && title !== 'data') {
        this._string.push(this._jsonToString(title, json[title], left));
      }
    }
  };
  
  BookmarksJsonToString.prototype._closeTitleFromJson = function(title, offset){
    if (!title) return;

    this._string.push(offset + '</DL><p>');
  };
  
  BookmarksJsonToString.prototype._getString = function(){
    return this._string.join('\n');
  };
  
  return new BookmarksJsonToString();
});