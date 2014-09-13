/** @jsx React.DOM */

var React = require('react');

var SearchBar = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" placeholder="Search..." />
      </form>
    );
  }
});

module.exports = SearchBar;
