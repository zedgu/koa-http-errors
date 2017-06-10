'use strict';

const koa = require('koa');
const agent = require('supertest');
const error = require('http-errors');

async function router(ctx, next) {
  const path = ctx.path.match(/\/(\w+)/)[1];
  const status = parseInt(path);
  if (status) {
    if (404 === status || 401 === status) {
      ctx.status = status;
    } else {
      throw new error(status);
    }
  } else {
    const e = new Error(path);
    if (e.message == 'expose') {
      e.expose = true;
    }
    throw e;
  }
  await next();
}

describe('No Options', function() {
  const app = new koa();

  app.use(require('..')());
  app.use(router);

  const request = agent(app.callback());

  describe('1. Should response in text type when No header "Accept"', function() {
    it('1.1 Throw 500 when application error occurred', function(done) {
      request
        .get('/err')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect('Code: \nError: Internal Server Error\nStatus: 500\nrequest: /err', done);
    });
    it('1.2 Throw 500 when server side error occurred', function(done) {
      request
        .get('/500')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect('Code: \nError: Internal Server Error\nStatus: 500\nrequest: /500', done);
    });
    it('1.3 Throw normal error with message', function(done) {
      request
        .get('/401')
        .expect(401)
        .expect('Content-Type', /^text\/plain/)
        .expect('Unauthorized', done);
    });
  });
  describe('2. Should response in json type when header "Accept" is set', function() {
    it('2.1 Throw 500 when application error occurred', function(done) {
      request
        .get('/err')
        .set('Accept', 'application/json')
        .expect(500)
        .expect('Content-Type', /^application\/json/)
        .expect(/Internal Server Error/, done);
    });
    it('2.2 Throw 500 when server side error occurred', function(done) {
      request
        .get('/500')
        .set('Accept', 'application/json')
        .expect(500)
        .expect('Content-Type', /^application\/json/)
        .expect(/Internal Server Error/, done);
    });
    it('2.3 Throw normal error with message', function(done) {
      request
        .get('/404')
        .set('Accept', 'application/json')
        .expect(404)
        .expect('Content-Type', /^application\/json/)
        .expect(/Not Found/, done);
    });
  });
  describe('3. Should response in text type when header "Accept" is set', function() {
    it('3.1 Throw 500 when application error occurred', function(done) {
      request
        .get('/err')
        .set('Accept', 'text/html')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect(/Internal Server Error/, done);
    });
    it('3.2 Throw 500 when server side error occurred', function(done) {
      request
        .get('/500')
        .set('Accept', 'text/html')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect(/Internal Server Error/, done);
    });
    it('3.3 Throw normal error with message', function(done) {
      request
        .get('/404')
        .set('Accept', 'text/html')
        .expect(404)
        .expect('Content-Type', /^text\/plain/)
        .expect(/Not Found/, done);
    });
  });
});
describe('Set Options', function() {
  describe('4. Test for specifc type, like text/xml', function() {
    it('4.1 Should got plain text type when options.render is not given', function(done) {
      const app = new koa();

      app.use(require('..')({type:'text/xml'}));
      app.use(router);

      const request = agent(app.callback());

      request
        .get('/err')
        .set('Accept', 'text/xml')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect('Code: \nError: Internal Server Error\nStatus: 500\nrequest: /err', done);
    });
    it('4.2 Should got xml type when options.render is given', function(done) {
      const app = new koa();

      app.use(require('..')({
        type: 'text/xml',
        render: function (content) {
          return '<?xml version="1.0" encoding="UTF-8"?><response><error>' + content.msg + '</error></response>';
        }
      }));
      app.use(router);

      const request = agent(app.callback());

      request
        .get('/500')
        .set('Accept', 'text/xml')
        .expect(500)
        .expect('Content-Type', /^text\/xml/)
        .expect('<?xml version="1.0" encoding="UTF-8"?><response><error>Internal Server Error</error></response>', done);
    });
  });
  describe('5. Test for html type', function() {
    it('5.1 Should got plain text type when options.template is not given', function(done) {
      const app = new koa();

      app.use(require('..')({engine: 'ejs'}));
      app.use(router);

      const request = agent(app.callback());

      request
        .get('/err')
        .set('Accept', 'text/html')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect(/Internal Server Error/, done);
    });
    it('5.2 Should got plain text type when options.engine is not given', function(done) {
      const app = new koa();

      app.use(require('..')({template: __dirname + '/error.ejs'}));
      app.use(router);

      const request = agent(app.callback());

      request
        .get('/err')
        .set('Accept', 'text/html')
        .expect(500)
        .expect('Content-Type', /^text\/plain/)
        .expect(/Internal Server Error/, done);
    });
    it('5.2 Should got html type when options.engine and options.template are given', function(done) {
      const app = new koa();

      app.use(require('..')({
        engine: 'ejs',
        template: __dirname + '/error.ejs'
      }));
      app.use(router);

      const request = agent(app.callback());

      request
        .get('/err')
        .set('Accept', 'text/html')
        .expect(500)
        .expect('Content-Type', /^text\/html/)
        .expect(/<title>500<\/title>/, done);
    });
  });
});
describe('Test for error message expose', function() {
  describe('In test mode', function() {
    const app = new koa();

    app.use(require('..')());
    app.use(router);

    const request = agent(app.callback());

    it('Should not expose message', function(done) {
      request
        .get('/err')
        .expect(500)
        .expect(/Internal Server Error/, done);
    });
    it('Should expose message when error.expose == true', function(done) {
      request
        .get('/expose')
        .expect(500)
        .expect(/expose/, done);
    });
  });
  after(function() {
    describe('In development mode', function() {
      process.env.NODE_ENV = null;
      delete process.env.NODE_ENV;
  
      const app = new koa();
  
      app.use(require('..')());
      app.use(router);
  
      const request = agent(app.callback());
  
      it('Should expose message', function(done) {
        request
          .get('/err')
          .expect(500)
          .expect(/Error: err/, done);
      });
      it('Should expose message', function(done) {
        request
          .get('/expose')
          .expect(500)
          .expect(/expose/, done);
      });
    });
  });
});