/** @jsx React.DOM */

var React = require('react');

var SearchBar = require('./search-bar');
var SearchResults = require('./search-results');
var CurrentVideo = require('./current-video');

var VideoLibrary = React.createClass({
  render: function() {
    // fixed video segment id for testing
    var segmentId = '39ef7b10-944e-4449-a476-bffc820f3e93';

    return (
      <div>
        <SearchBar />
        <SearchResults />
        <CurrentVideo segmentId={segmentId} />
      </div>
    );
  }
});

module.exports = VideoLibrary;
