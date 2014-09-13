/** @jsx React.DOM */

var React = require('react');

var SearchResult = React.createClass({
  render: function() {
    var episode = this.props.episode;

    return (
      <div>
        <img src={episode.image} />
        <h3>{episode.title}</h3>
        <p>{episode.matches} matches</p>
      </div>
    );
  }
});

module.exports = SearchResult;
