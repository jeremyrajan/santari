const http = require('http');
const router = require('light-router');
const StaticServer = require('static-server');
const logger = require('../../src/libs/logger');
const path = require('path');
const handlers = require('./handlers');
const queryString = require('querystring');

const setHeader = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
};

module.exports = {
  startFrontEnd(port) {
    const server = new StaticServer({
      rootPath: path.join(__dirname, '..', 'frontend'),
      name: 'Santari',
      port,
      cors: '*',
      followSymlink: true,
      templates: {
        index: 'index.html'
      }
    });

    server.start(() => {
      logger.info(`Front-End Server listening at :${server.port}`);
    });
  },
  startBackEnd(port) {
    // Start an http server and pass all requests to light-router
    http.createServer(router).listen(port);

    // all the handlers
    router.get('/jobs', (req, res) => {
      setHeader(req, res);
      return handlers.getJobs()
        .then((jobs) => {
          res.end(jobs);
        })
        .catch((err) => {
          res.status(500);
          res.end(err);
        });
    });

    // create jobs
    router.get('/job/create', (req, res) => {
      setHeader(req, res);
      const job = queryString.parse(req.url.split('?')[1]);
      return handlers.createJob(job.cmd, job.interval)
        .then((status) => {
          console.log(status);
          res.end('ok');
        })
        .catch((err) => {
          console.log(err);
          res.end(err);
        });
    });
  },
  init(port = { f: 9090, b: 8080 }) {
    logger.info(`Back-End Server listening at :${port.b}`);
    this.startBackEnd(port.b);
    this.startFrontEnd(port.f);
  }
};
