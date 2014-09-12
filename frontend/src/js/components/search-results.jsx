
/** @jsx React.DOM */

var React = require('react');
var SearchResult = require('./search-result');

module.exports = React.createClass({
  render: function() {
    var results = [];

    return (
      <div>
        {results}
      </div>
    );
  }
});
