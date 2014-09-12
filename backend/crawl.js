var fs = require('fs');
var request = require('request');
var _ = require('lodash');
var Q = require('q');

var waitTime = 1000;
var requestQueue = Q(0);

function get(options) {
    var deferred = Q.defer();
    requestQueue = requestQueue.then(function() {
        var requestDeferred = Q.defer();
        console.log('get', options.url, options);
        request.get(options, function(error, response, data) {
            if(!error && response.statusCode === 200) {
                deferred.resolve(data);
            }
            else {
                console.log('fail', options, arguments);
                deferred.reject("Can't do it");
            }
            setTimeout(function() {
                requestDeferred.resolve();
            }, options.wait || waitTime);
        });
        return requestDeferred.promise;
    });
    return deferred.promise;
}

// detail of show
// "http://il.srf.ch/integrationlayer/1.0/ue/srf/assetGroup/detail/c38cc259-b5cd-4ac1-b901-e3fddd901a3d.json";

// list episodes
// "http://il.srf.ch/integrationlayer/1.0/ue/srf/assetSet/listByAssetGroup/c38cc259-b5cd-4ac1-b901-e3fddd901a3d.json";

var shows = require('./shows.json');

function fetchAssetSet(show, page) {
    var deferred = Q.defer();

    console.log('fetch', show.title, page);
    page = page || 1;
    // pageSize - max 100, pageNumber, maxPublishedDate
    get({
        url: "http://il.srf.ch/integrationlayer/1.0/ue/srf/assetSet/listByAssetGroup/"+show.id+".json?pageSize=94&pageNumber="+page,
        json: true
    }).then(function(data) {
        show.AssetSet = show.AssetSet.concat(data.AssetSets.AssetSet);
        show.AssetSet = _.uniq(show.AssetSet, function(asset) {
            return asset.id;
        });
        fs.writeFileSync('shows.json', JSON.stringify(shows, null, 4), 'utf8');
        console.log(
            show.title,
            'got', show.AssetSet.length,
            'total', data.AssetSets['@total']
        );

        if(page < data.AssetSets['@maxPageNumber'] && show.AssetSet.length < data.AssetSets['@total']) {
            fetchAssetSet(show, page + 1).then(function() {
                deferred.resolve();
            });
        }
        else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

exports.fetchShows = function() {
    return Q.allSettled(shows.srf.map(function(show) {
        if(!show.AssetSet) {
            // need better logic later
            // now just crawl shows without assets
            show.AssetSet = [];
        }
        if(show.AssetSet.length < 1000) {
            return fetchAssetSet(show);
        }
    }));
};

function fetchTranscripts() {
    var queue = [];
    var transcripts = fs.readdirSync('transcripts/raw');
    console.log('transcripts', transcripts.length);
    shows.srf.forEach(function(show) {
        show.AssetSet.forEach(function(episode) {
            var mainVideo;
            if(episode.Assets.Video) {
                mainVideo = episode.Assets.Video.filter(function(video) {
                    return video.assetSubSetId === 'EPISODE' && video.position === 0;
                });
            }
            if(mainVideo && mainVideo.length === 1) {
                mainVideo = mainVideo[0];
                if(transcripts.indexOf(episode.id+".ttml") !== -1) {
                    return;
                }
                queue.push(
                    get({wait: 200, url: "http://www.srf.ch/player/subtitles/"+mainVideo.urn+"/subtitle.ttml"}).then(function(data) {
                        fs.writeFileSync('transcripts/raw/'+episode.id+'.ttml', data, 'utf8');
                    })
                );
            }
            else {
                if(mainVideo && mainVideo.length) {
                    console.log('multiple main video', show.title, episode.id);
                }
                else {
                    console.log('missing main video', show.title, episode.id);
                }
            }
        });
    });
    return Q.allSettled(queue);
}
exports.fetchTranscripts = fetchTranscripts;

var parseXml = require('xml2js').parseString;
var d3 = require('d3');

function timeToMs(time) {
    var comp = time.split(':').map(Number);
    return ((comp[0] * 60 * 60) + (comp[1] * 60) + comp[2]) * 1000;
}

function parseTranscript(file) {
    var deferred = Q.defer();
    parseXml(fs.readFileSync('transcripts/raw/' + file, {encoding: 'utf8'}), function(err, result) {
        var paragraphs = [];
        result.tt.body[0].div[0].p.forEach(function(paragraph) {
            var texts = paragraph.span.map(function(span) {
                return (span._ || '').replace(/^\s+|\s+$/g,'');
            });
            paragraphs.push({
                start: timeToMs(paragraph.$.begin),
                end: timeToMs(paragraph.$.end),
                duration: paragraph.$.dur.replace(/ms$/, ''),
                text: texts.join(' ')
            });
        });
        fs.writeFileSync('transcripts/tsv/'+file.replace('.ttml', '.tsv'), d3.tsv.format(paragraphs), 'utf8');
        return deferred.resolve();
    });
    return deferred.promise;
}

exports.parseTranscripts = function() {
    return Q.allSettled(
        fs.readdirSync('transcripts/raw').map(function(file) {
            return parseTranscript(file);
        })
    );
};