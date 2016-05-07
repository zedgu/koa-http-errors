koa-http-errors
===============

Assertion for koa context.

[![NPM version][npm-image]][npm-url] 
[![build status][travis-image]][travis-url] 
[![Test coverage][coveralls-image]][coveralls-url]
[![NPM Monthly Downloads][npm-download]][npm-url]
[![Dependencies][david-image]][david-url]
[![License][license-image]][license-url]
[![Tips][tips-image]][tips-url]

Usage
-----

```javascript
var errors = require('koa-http-errors');

var app = koa();
app.use(errors());
```

Options
-------

```javascript
app.use(errors({
  type: 'text/xml', // optional, to set the Content-type of the response
  engine: 'ejs', // optional, any template engine, see https://www.npmjs.com/package/co-render
  template: './error.ejs', // optional, template file path
  cache: false, // optional, default is true
  render: function *(content) {
    // todo
    // content.msg = error.message
    // content.code = error.code
    // content.env = process.env.NODE_ENV
    // content.engine = options.engine
    // content.template = options.template
    // content.cache = options.cache
    // content.ctx = ctx of koa
    // content.err = err
  } // optional, must be a generator function
}));
```

[npm-image]: https://img.shields.io/npm/v/koa-http-errors.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-http-errors
[travis-image]: https://img.shields.io/travis/zedgu/koa-http-errors.svg?style=flat-square
[travis-url]: https://travis-ci.org/zedgu/koa-http-errors
[coveralls-image]: https://img.shields.io/coveralls/zedgu/koa-http-errors.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/zedgu/koa-http-errors?branch=master
[david-image]: http://img.shields.io/david/zedgu/koa-http-errors.svg?style=flat-square
[david-url]: https://david-dm.org/zedgu/koa-http-errors
[license-image]: http://img.shields.io/npm/l/koa-http-errors.svg?style=flat-square
[license-url]: https://github.com/zedgu/koa-http-errors/blob/master/LICENSE
[npm-download]: http://img.shields.io/npm/dm/koa-http-errors.svg?style=flat-square
[tips-image]: http://img.shields.io/gittip/zedgu.svg?style=flat-square
[tips-url]: https://www.gittip.com/zedgu/
