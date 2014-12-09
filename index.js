var statuses = require('statuses');
var createError = require('http-err');

module.exports = function(app, options) {
  options = options || {};

  app.context.throw = function(){
    throw createError.apply(null, arguments);
  };
  app.context.assert = function(determination, statusCode, statusMessage, options) {
    if (determination) return;
    throw createError(statusCode, statusMessage, options);
  };

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

    var msg = statuses.empty[this.status] ? null : (err.expose ? err.message : statuses[this.status]);
    this.res.statusCode = 'number' === typeof err.status ? err.status : 500;
    this.res.statusMessage = msg;

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