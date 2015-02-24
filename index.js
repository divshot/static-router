var path = require('path');
var globject = require('globject');
var url = require('fast-url-parser');
var deliver = require('deliver');
var directoryIndex = require('directory-index');
var fileExists = require('file-exists');
var mime = require('mime-types');
var slasher = require('glob-slasher');
var slash = require('glob-slash');

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
    var defs = {};
    
    // Ensure order of routes when given an array
    if (Array.isArray(routeDefinitions)) {
      routeDefinitions
        .forEach(function (routes) {
          
          Object.keys(routes).forEach(function (key) {
            
            defs[key] = routes[key];
          })
        });
    }
    else {
      defs = routeDefinitions;
    }
  
    var routes = globject(slasher(defs));
    var filepath = routes(slasher(pathname));
    
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