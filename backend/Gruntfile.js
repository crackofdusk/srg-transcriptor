module.exports = function(grunt) {

  var srf = require('./crawl.js');
  grunt.registerTask('fetch:shows', 'Get episodes of shows', function() {
    var done = this.async();
    srf.fetchShows().then(function() {
      done();
    });
  });
  grunt.registerTask('fetch:transcripts', 'Get transcripts of episodes', function() {
    var done = this.async();
    srf.fetchTranscripts().then(function() {
      done();
    });
  });



  grunt.registerTask('parse:transcripts', 'Convert transcripts to tsv', function() {
    var done = this.async();
    srf.parseTranscripts().then(function() {
      done();
    });
  });
  grunt.registerTask('parse:shows', 'Convert shows to json', function() {
    srf.parseShows();
  });

};