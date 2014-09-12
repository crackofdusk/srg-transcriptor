/** @jsx React.DOM */

var React = require('react');

var SearchBar = require('./search-bar');
var SearchResults = require('./search-results');
var CurrentVideo = require('./current-video');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <SearchBar />
        <SearchResults />
        <CurrentVideo />
      </div>
    );
  }
});
