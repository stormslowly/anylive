#!/usr/bin/env node

/* global require, console, process */
'use strict';
var gaze = require('gaze');
var tinylr = require('tiny-lr');
var connect = require('connect');
var livereload = require('connect-livereload');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var liveReloadServer = new tinylr();
// liveReloadServer.removeAllListeners('error');
// liveReloadServer.on('error',function(err){
//   console.log('livereload server failed :',err);
//   process.exit(1);
// });

var cwd = process.cwd();
var staticServerPort = parseInt(process.argv[2]) || 8080;

var staticServer = connect();
staticServer.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

var openURL = function(url) {
  switch (process.platform) {
    case 'darwin':
      exec('open ' + url);
      break;
    case 'win32':
      exec('start ' + url);
      break;
    default:
      spawn('xdg-open', [url]);
      // I use `spawn` since `exec` fails on my machine (Linux i386).
      // I heard that `exec` has memory limitation of buffer size of 512k.
      // http://stackoverflow.com/a/16099450/222893
      // But I am not sure if this memory limit causes the failure of `exec`.
      // `xdg-open` is specified in freedesktop standard, so it should work on
      // Linux, *BSD, solaris, etc.
  }
};



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