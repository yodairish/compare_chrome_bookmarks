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