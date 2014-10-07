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