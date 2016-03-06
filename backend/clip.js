var _ = require('lodash');
var ffmpeg = require('fluent-ffmpeg');
var uuid = require('uuid');
var Q = require('q');
var fs = require('fs');
var mkdirp = require('mkdirp');
var program = require('commander');
var search = require('./search');
var util = require('./util');
var srf = require('./crawl.js');

program
  .version('0.0.1')
  .option('-m, --message <text>', 'A message to transform into a SRF clip')
  .parse(process.argv);

var message = program.message;
if (!message) {
  throw new Error('You need to pass a message via -m');
}

var words = message.split(/[ ,\.]+/g).filter(Boolean);

var results = words
  .map(function(word) {
    return {
      word: word, 
      shows: search(word, true).filter(function(show) {
        return show.matches > 0;
      })
    };
  })
  .filter(function(result) {
    return result.shows.length;
  });

var shuffle = _.shuffle;

var episodes = [];
results.forEach(function(result) {
  shuffle(result.shows.splice(0, 5)).some(function(show) {
    return show.episodes.some(function(episode) {
      var alreadyUsed = _.find(episodes, function(e) { return e.episode.videoId === episode.videoId; });
      if (!alreadyUsed) {
        episodes.push({
          word: result.word,
          episode: episode
        });
        return true;
      }
    });
  });
});

var lines = episodes.map(function(result) {
  return {
    word: result.word,
    videoId: result.episode.videoId,
    line: shuffle(result.episode.transcriptData.filter(function(line) {
      return line.text.match(util.queryRegex(result.word));
    }))[0]
  };
});

var options = {
  // logger: {
  //   debug: console.log,
  //   info: console.log,
  //   warn: console.log,
  //   error: console.log
  // },
  // niceness: 20
};
var source = 'url';

function getLine(video) {
  var tmpFile = __dirname + '/clips/tmp/' + video.word + '_' + uuid.v4() + '.ts';
  var deferred = Q.defer();

  ffmpeg(video[source], _.clone(options))
    .seekInput(video.line.start / 1000)
    // .duration(video.line.duration / 1000)
    .inputOptions([
      '-accurate_seek',
      '-t ' + (video.line.duration / 1000)
    ])
    // .format('mpegts')
    .size('640x360')
    .save(tmpFile)
    .on('start', function(cmd) {
      console.log(cmd);
    })
    .on('error', function(err) {
      console.log('Failed', video.word, err);
      deferred.resolve({
        error: err
      });
    })
    .on('end', function() {
      console.log('Fetched', video.word);
      deferred.resolve({
        tmpFile: tmpFile,
        word: video.word,
        video: video
      });
    });

  return deferred.promise;
}

function addMP4Url(line, data) {
  if (!data.Video.Downloads) return;
  var urls = _.find(
    data.Video.Downloads.Download,
    function(download) { return download['@protocol'] === 'HTTP'}
  ).url;
  line.url = _.find(
    urls,
    function(url) { return url['@quality'] === 'SD'}
  ).text;
}

function addStream(line, data) {
  if (!data.Video.Playlists.Playlist) return;
  var urls = _.find(
    data.Video.Playlists.Playlist,
    function(playlist) { return playlist['@protocol'] === 'HTTP-HLS'}
  ).url;
  line.stream = _.find(
    urls,
    function(url) { return url['@quality'] === 'SD'}
  ).text;
}

Promise.all(
  lines.map(function(line) {
    return srf.fetchPlayInformation(line.videoId).then(function(data) {
      addMP4Url(line, data);
      addStream(line, data);
    });
  })
)
  .then(function() {
    var linesWithSource = lines.filter(function(line) { return line[source]; });
    console.log(linesWithSource);
    console.log('Downloadable ', linesWithSource.length, ' Missing ', lines.length - linesWithSource.length);

    mkdirp.sync(__dirname + '/clips/tmp');
    return Promise.all(linesWithSource.map(getLine));
  })
  .then(function(videos) {
    var cmd = ffmpeg(_.clone(options));
    videos
      .filter(function(video) { return !video.error; })
      .forEach(function(video) {
        cmd.addInput(video.tmpFile);
      });

    var fileName = videos.map(function(v) { return v.word; }).join('-');
    console.log('File ', fileName);
    // save data
    fs.writeFileSync(
      __dirname + '/clips/' + fileName + '.json',
      JSON.stringify(videos.map(function(video) { return video.video; }), null, 4),
      'utf8'
    );
    cmd.mergeToFile(__dirname + '/clips/' + fileName + '.mp4')
      .on('start', function(cmdline) {
        console.log('Command line: ' + cmdline);
      })
      .on('progress', function(progress) {
        console.log('Combining: ' + progress.percent + '% done');
      })
      .on('error', function(err) {
        throw new Error(err);
      })
      .on('end', function(err, stdout, stderr) {
        // console.log(err, stdout, stderr);
        console.log('Yey!');
      })
  })
  .catch(function() {
    console.log('error', arguments);
  });
