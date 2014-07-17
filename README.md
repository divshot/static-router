# superstatic-routes

Superstatic custom routes middleware

## Install

```
npm install superstatic-routes --save
```

## Usage

As a Connect/Express middleware

```js
var http = require('http');
var connect = require('connect');
var routes = require('superstatic-routes');

var app = connect();

app.use(routes({
  '/some-route': '/some-file.html',
  '**': '/index.html'
}));

http.createServer(app).listen(3000, function () {
  
});
```

In Superstatic

```js
var superstatic = require('superstatic');

var app = superstatic({
  // this config object can also just be the superstatic.json file
  // See https://github.com/divshot/superstatic#configuration
  config: {
    routes: {
      '/some-route': '/some-file.html',
      '/**': '/index.html'
    }
  }
});

app.listen(3000, function (err) {

});
```

## Run Tests

```
npm install
npm test
```
