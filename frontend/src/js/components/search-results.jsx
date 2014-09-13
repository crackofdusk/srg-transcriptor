
/** @jsx React.DOM */

var React = require('react');
var SearchResult = require('./search-result');

var SearchResults = React.createClass({
  render: function() {
    var results = [];
    this.props.results.forEach(function(result) {
      if (result.matches > 0) {
        result.episodes.forEach(function (episode) {
          results.push(<SearchResult episode={episode} />);
        });
      }
    });

    return (
      <div>
        {results}
      </div>
    );
  }
});

module.exports = SearchResults;
