/** @jsx React.DOM */

var React = require('react');

var VideoPlayer = require('./video-player');
var VideoTranscript = require('./video-transcript');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <VideoPlayer />
        <VideoTranscript />
      </div>
    )
  }
});
