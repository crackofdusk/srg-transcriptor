var express = require('express');
var d3 = require('d3');
var _ = require('lodash');
var fs = require('fs');

var app = express();

var shows = require('./showsWithTranscripts.json');
shows.forEach(function(show) {
    show.episodes.forEach(function(episode) {
        episode.transcriptText = d3.tsv.parse(fs.readFileSync(__dirname+'/'+episode.transcript, {encoding: 'utf8'}), function(r) { return r.text; }).join(' ');
    });
});

var cors = require('express-cors');
app.use(cors({
    allowedOrigins: ['localhost:*']
}));

app.get('/search', function(req, res) {
    var query;
    if(req.query.q) {
        query = new RegExp(
            req.query.q.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
            'gi'
        );
    }
    var result = shows.map(function(show) {
        var clonedShow = _.clone(show);
        clonedShow.episodes = show.episodes.map(function(episode) {
            var clonedEpisode = _.clone(episode);
            if(query) {
                clonedEpisode.matches = (episode.transcriptText.match(query) || {}).length;
            }
            clonedEpisode.transcriptText = undefined;
            return clonedEpisode;
        });
        if(query) {
            clonedShow.episodes = clonedShow.episodes.filter(function(clonedEpisode) {
                return clonedEpisode.matches;
            });
            clonedShow.episodes = _.sortBy(clonedShow.episodes, function(episode) {
                return episode.matches;
            }).reverse();
        }
        clonedShow.total = show.episodes.length;
        clonedShow.matches = d3.sum(clonedShow.episodes, function(d) {
            return d.matches || 0;
        });
        return clonedShow;
    });
    res.json(_.sortBy(result, function(show) {
        return show.matches;
    }).reverse());
});

var oneDay = 86400000;
var compression = require('compression');

app.use(compression());

app.get('/transcripts/simple/:file', function(req, res) {
    var file = req.params.file.match(/^[\w-]+\.tsv$/);
    if(!file) {
        res.status(404).end();
        return;
    }
    res.sendFile(__dirname + '/transcripts/simple/' + file[0]);
});
app.use(express.static(__dirname + '/angular/dist'));

app.listen(process.env.PORT || 3000);