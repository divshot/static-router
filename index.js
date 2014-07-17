var fs = require('fs');
var path = require('path');
var slash = require('slasher');
var globject = require('globject');
var url = require('fast-url-parser');
var deliver = require('deliver');

module.exports = function (routeDefinitions, options) {
  options = options || {};
  
  var root = options.root || process.cwd();
  var indexFile = options.index || 'index.html';
  
  if(options.exists) exists = options.exists;
  
  return function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    var routes = globject(slash(routeDefinitions));
    var filepath = routes(slash(pathname));
    
    if (!filepath) return next();
    
    filepath = directoryIndex(filepath, indexFile);
    var fullpath = path.join(root, filepath);
    
    if (!exists(filepath)) return next();
    
    req.url = fullpath;
    deliver(req).pipe(res);
  };
  
  function exists (filepath) {
    var fullpath = path.join(root, filepath);
    
    if (!fs.existsSync(fullpath)) return false;
    if (!fs.statSync(fullpath).isFile()) return false;
    
    return true;
  }
};

function directoryIndex (filepath, index) {
  // Serve the index file of a directory
  if (filepath && path.extname(filepath) !== '.html') {
    filepath = path.join(slash(filepath), index);
  }
  
  return filepath;
}
