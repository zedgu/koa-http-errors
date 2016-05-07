const coRender = require('co-render');
const http = require('http');

function *jsonRender(content) {
  return {
    code: content.err.code,
    error: content.msg,
    status: content.ctx.status,
    request: content.ctx.path
  };
}

function *htmlRender(content) {
  return yield coRender(content.template, {
    engine: content.engine,
    cache: content.cache,
    env: content.env,
    ctx: content.ctx,
    request: content.ctx.request,
    response: content.ctx.response,
    error: content.err.message,
    stack: content.err.stack,
    status: content.ctx.status,
    code: content.err.code
  });
}

function *textRender(content) {
  return 'Code: ' + content.code + '\n'
    + 'Error: ' + content.msg + '\n'
    + 'Status: ' + content.ctx.status + '\n'
    + 'request: ' + content.ctx.path;
}

module.exports = function error(options) {
  options = options || {};

  const env = process.env.NODE_ENV || 'development';

  return function *(next){
    try {
      yield next;
      if (404 == this.response.status && !this.response.body) {
        this.throw(404);
      }
    } catch (err) {
      this.status = err.status || 500;

      this.app.emit('error', err, this);

      const content = {
        msg: (err.expose || ('development' === env)) ? err.message : http.STATUS_CODES[this.status],
        code: err.code || '',
        env: env,
        engine: options.engine,
        cache: options.cache || true,
        ctx: this,
        err: err,
        template: options.template
      };
      var type = this.accepts([options.type || 'text/plain', 'application/json', 'text/html']);
      var render;

      switch (type.split('/').pop()) {
        case 'json':
          render = options.render || jsonRender;
          break;
        case 'html':
          (options.template && options.engine) ? render = htmlRender : (render = textRender, type = 'text/plain'); 
          break;
        default:
          options.render ? render = options.render : (render = textRender, type = 'text/plain');
      }

      this.type = type;
      this.body = yield render(content);
    }
  }
};