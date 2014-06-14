'use strict';
/* global require, console, process */
var gaze = require('gaze');
var tinylr = require('tiny-lr');
var connect = require('connect');
var livereload = require('connect-livereload');
// var lr ={
//   port:35729
// };
console.log(process.argv);
return;

var rlServer = new tinylr();
rlServer.removeAllListeners('error');
rlServer.on('error',function(err){
  console.log('livereload server failed :',err);
  process.exit(1);
});

var cwd = process.cwd();
var staticServerPort = parseInt( process.argv[2] ) || 8080;

var staticServer = connect();
staticServer.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

staticServer.use(livereload({
  port: 35729
}));
staticServer.use(connect.static(cwd));
staticServer.use(connect.directory(cwd));


gaze('*.json', function(err,watcher){
  if(err) return console.log(err);
  console.log('big brother is watching..');

  rlServer.listen(35729,function(err){
    if(err) return console.log(err);

    console.log('second brother is watching..');
    watcher.on('all',function(e,files){
      console.log('files changed',files);
      rlServer.changed({body:{files:files}});
    });

    staticServer.listen(9090, function (err) {
      if (err) return console.log('static Srever error',err);
        console.log('static Server is ready on port: '+staticServerPort);
    });
  });
});