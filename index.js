"use strict";
var request = require('request');
var mysql   = require('mysql');
var async = require("async");
var config = require('./config.js');

var req = {
  url: "http://api.btnapps.net/",
  method: "POST",
  json: {
  	method: "getTorrents",
  	params: [
  		config.apikey,
  		{
  			   "category":  "Episode",
           "age":       "<100000"
  		},
  		1000
  	],
  	id: 1
  }
}

function addToDB(torrent, callback) {
  var post = {
    "TorrentID":    torrent.TorrentID,
    "SeriesID":     torrent.SeriesID,
    "Snatched":     torrent.Snatched,
    "Source":       torrent.Source,
    "Container":    torrent.Container,
    "Codec":        torrent.Codec,
    "Resolution":   torrent.Resolution,
    "Origin":       torrent.Origin,
    "ReleaseName":  torrent.ReleaseName,
    "Size":         torrent.Size,
    "Time":         torrent.Time,
    "Group":        /^[A-Za-z0-9\.\-]*\-([A-Za-z0-9]*)$/.exec(torrent.ReleaseName)[1]
  }
  var query = connection.query('INSERT INTO torrents SET ?', post, function(err, result) {
    if(err)
      console.log(err);
    callback();
  });
}

function processTorrent(torrent, today, callback) {
  var age = today/1000 - parseInt(torrent.Time);
  //only accept torrents released 24 to 25 hours ago,
  //1 minute buffer to not miss anything,
  //mysql will avoid duplicates
  if(age > 24*60*60 - 1*60 && age < 25*60*60 + 1*60)
    if(/^[A-Za-z0-9\.\-]*-[A-Za-z0-9]*$/.test(torrent.ReleaseName)) {
      console.log("accepted:\t" + torrent.ReleaseName);
      addToDB(torrent, callback);
    }
    else {
      console.log("rejected:\t" + torrent.ReleaseName);
      callback();
    }
  else
    callback();
}

function requestCallback(error, response, body) {
  if (!error && response.statusCode == 200 && body.result) {
    var today = Date.now();
    var asyncTasks = [];
    Object.keys(body.result.torrents).forEach(function(t) {
      var torrent = body.result.torrents[t];
			asyncTasks.push(function(callback){
        processTorrent(torrent, today, callback);
      });
	  });
    async.parallel(asyncTasks, function() {
      connection.end();
    });
  }
}

var connection = mysql.createConnection(config.mysqlConfig);
connection.connect();
request(req, requestCallback);
