var assert = require('assert');
var statuses = require('statuses');
var createError = require('http-errors');

module.exports = function(app, options) {
  options = options || {};

  app.use(function* error(next){
    var err = null;
    try {
      yield next;
      if (404 == this.response.status && !this.response.body) {
        err = createError(404);
      }
    } catch (e) {
      err = e;
    }
    if (err === null) {
      return;
    }
    
    this.app.emit('error', err, this);
    if ('ENOENT' == err.code) err.status = 404;

    if (options.render) {
      options.render.bind(this)(err);
      return;
    }

    this.status = 'number' === typeof err.status && statuses[err.status] ? err.status : 500;
    var msg = statuses.empty[this.status] ? null : (err.expose ? err.message : statuses[this.status]);

    if ('json' === this.accepts('text', 'json')) {
      this.type = 'json';
      msg = msg ? JSON.stringify({error:msg}) : msg;
      this.res.end(msg);
      return;
    }

    this.type = 'text';
    this.res.end(msg);
  });
};