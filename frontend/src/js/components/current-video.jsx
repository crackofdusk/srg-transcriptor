/** @jsx React.DOM */

var React = require('react');

var VideoPlayer = require('./video-player');
var VideoTranscript = require('./video-transcript');

var CurrentVideo = React.createClass({
  render: function() {
    var segmentId = this.props.segmentId;

    return (
      <div>
        <VideoPlayer segmentId={segmentId} />
        <VideoTranscript />
      </div>
    )
  }
});

module.exports = CurrentVideo;
