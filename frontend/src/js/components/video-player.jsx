/** @jsx React.DOM */

var React = require('react');

var VideoPlayer = React.createClass({
  render: function() {
    var playerId = this.props.playerId;
    var segmentId = this.props.segmentId;
    var businessUnit = 'srf';
    // var source = 'http://test.tp.srgssr.ch/' + businessUnit + '/portal/' + segmentId;
    var source = 'http://www.technical-player-srg.ch/p/default?urn=urn:' + businessUnit + ':ais:video:' + segmentId;

    return (
      <iframe
        id={playerId}
        src={source}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen>
      </iframe>
    )
  }
});

module.exports = VideoPlayer;
