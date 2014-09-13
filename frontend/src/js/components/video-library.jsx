/** @jsx React.DOM */

var React = require('react');

var SearchBar = require('./search-bar');
var SearchResults = require('./search-results');
var CurrentVideo = require('./current-video');

var VideoLibrary = React.createClass({
  getInitialState: function() {
    return {results: []};
  },

  updateResults: function(results) {
    this.setState({results: results})
  },

  render: function() {
    // fixed video segment id for testing
    var segmentId = '39ef7b10-944e-4449-a476-bffc820f3e93';
    var results = this.state.results;

    return (
      <div>
        <SearchBar updateResults={this.updateResults} />
        <SearchResults results={results} />
        <CurrentVideo segmentId={segmentId} />
      </div>
    );
  }
});

module.exports = VideoLibrary;
