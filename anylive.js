#!/usr/bin/env node

/* global require, console, process */
'use strict';
var gaze = require('gaze');
var tinylr = require('tiny-lr');
var connect = require('connect');
var livereload = require('connect-livereload');
var liveReloadServer = new tinylr();
var openURL = require('open');

var cwd = process.cwd();
var staticServerPort = parseInt(process.argv[2]) || 8080;

var staticServer = connect();
staticServer.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

staticServer.use(livereload({
  port: 35729
}));
staticServer.use(connect.static(cwd));
staticServer.use(connect.directory(cwd));

gaze(['**/*.js',
  '**/*.css',
  '**/*.html',
  '**/*.svg',
  '!.git/**',
  '!node_modules/**'
], function(err, watcher) {
  if (err) return console.log(err);
  console.log('File watching is ready...');

  watcher.on('error', function(err) {
    console.log('wahtch error', err);
  });

  liveReloadServer.server.on('error', function(err) {
    console.log('error in LiveReloadServer ');
    console.log(err);
    watcher.close();
    process.abort();
  });

  liveReloadServer.listen(35729, function() {
    console.log('LiveReloadServer is ready...');
    watcher.on('all', function(e, files) {
      console.log('File:', files, 'has', e, ' LiveReload Triggered!');
      liveReloadServer.changed({
        body: {
          files: files
        }
      });
    });

    staticServer.listen(staticServerPort, function(err) {
      if (err) return console.log('static Srever error', err);
      console.log('anylive Server is ready on port: ' + staticServerPort);
      openURL('http://127.0.0.1:' + staticServerPort);
    });
  });
});