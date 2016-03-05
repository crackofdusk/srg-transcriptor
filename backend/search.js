var d3 = require('d3');
var _ = require('lodash');
var fs = require('fs');

var shows = require('./showsWithTranscripts.json');
shows.forEach(function(show) {
    show.episodes.forEach(function(episode) {
        episode.transcriptText = d3.tsv.parse(fs.readFileSync(__dirname+'/'+episode.transcript, {encoding: 'utf8'}), function(r) { return r.text; }).join(' ');
    });
});

module.exports = function(query) {
    if(query) {
        query = new RegExp(
            query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
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

    return _.sortBy(result, function(show) {
        return show.matches;
    }).reverse();
}