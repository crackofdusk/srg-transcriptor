
/** @jsx React.DOM */

var React = require('react');
var SearchResult = require('./search-result');

var SearchResults = React.createClass({
  render: function() {
    var results = [];

    return (
      <div>
        {results}
      </div>
    );
  }
});

module.exports = SearchResults;
