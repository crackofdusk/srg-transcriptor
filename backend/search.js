var d3 = require('d3');
var _ = require('lodash');
var fs = require('fs');
var util = require('./util');

var shows = require('./showsWithTranscripts.json');
shows.forEach(function(show) {
    show.episodes.forEach(function(episode) {
        episode.transcriptData = d3.tsv.parse(fs.readFileSync(__dirname+'/'+episode.transcript, {encoding: 'utf8'}));
        episode.transcriptText = episode.transcriptData.map(function(r) { return r.text; }).join(' ');
    });
});

module.exports = function(query, withTranscripts) {
    if(query) {
        query = util.queryRegex(query);
    }
    var result = shows.map(function(show) {
        var clonedShow = _.clone(show);
        clonedShow.episodes = show.episodes.map(function(episode) {
            var clonedEpisode = _.clone(episode);
            if(query) {
                clonedEpisode.matches = (episode.transcriptText.match(query) || {}).length;
            }
            if(!withTranscripts) {
                clonedEpisode.transcriptData = undefined;
                clonedEpisode.transcriptText = undefined;
            }
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

    return _.sortBy(result, function(show) {
        return show.matches;
    }).reverse();
}