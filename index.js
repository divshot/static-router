var path = require('path');
var toxic = require('toxic');
var globject = require('globject');
var url = require('fast-url-parser');
var deliver = require('deliver');
var directoryIndex = require('directory-index');
var fileExists = require('file-exists');
var mime = require('mime-types');

module.exports = function (routeDefinitions, options) {
  
  options = options || {};
  
  var root = options.root || process.cwd();
  var indexFile = options.index || 'index.html';
  
  if(options.exists) fileExists = options.exists;
  
  return function (req, res, next) {
    
    if (!routeDefinitions) {
      return next();
    }
    
    var pathname = url.parse(req.url).pathname;
    var routes = globject(slash(routeDefinitions));
    var filepath = routes(normalize(pathname));
    
    if (!filepath) {
      return next();
    }
    
    filepath = directoryIndex(filepath, indexFile);
    
    if (!fileExists(filepath, {root: root})) {
      return next();
    }
    
    req.url = filepath;
    
    if (options.fullPath) {
      var p = options.fullPath(filepath);
      root = p.root;
      req.url = p.pathname;
    }
    
    deliver(req, res, {
      root: root,
      index: indexFile,
      contentType: mime.lookup(filepath),
      headers: options.headers
    }).pipe(res);
  };
};

function slash (spec) {
  
  return toxic(spec, {
    mutator: function (pathname) {
      
      return normalize(pathname);
    },
    keyMutator: function (key) {
      
      if (key.charAt(0) === '!') {
        return '!' + normalize(key.substr(1));
      }
      
      return normalize(key);
    }
  });
}

function normalize (value) {
  return path.normalize(path.join('/', value));
}