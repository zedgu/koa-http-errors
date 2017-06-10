'use strict';

const cons = require('consolidate');
const http = require('http');

function jsonRender(content) {
  return {
    code: content.err.code,
    error: content.msg,
    status: content.ctx.status,
    request: content.ctx.path
  };
}

function htmlRender(content) {
  return cons.ejs(content.template, {
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

function textRender(content) {
  return 'Code: ' + content.code + '\n'
    + 'Error: ' + content.msg + '\n'
    + 'Status: ' + content.ctx.status + '\n'
    + 'request: ' + content.ctx.path;
}

module.exports = function error(options) {
  options = options || {};

  const env = process.env.NODE_ENV || 'development';

  return async (ctx, next) => {
    try {
      await next();
      if (404 == ctx.response.status && !ctx.response.body) {
        ctx.throw(404);
      }
    } catch (err) {
      ctx.status = err.status || 500;

      ctx.app.emit('error', err, ctx);

      const content = {
        msg: (err.expose || ('development' === env)) ? err.message : http.STATUS_CODES[ctx.status],
        code: err.code || '',
        env: env,
        engine: options.engine,
        cache: options.cache || true,
        ctx: ctx,
        err: err,
        template: options.template
      };
      var type = ctx.accepts([options.type || 'text/plain', 'application/json', 'text/html']);
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

      ctx.type = type;
      ctx.body = await render(content);
    }
  }
};