/** @jsx React.DOM */

var React = require('react');

var reqwest = require('reqwest');

var SearchBar = React.createClass({
  getInitialState: function() {
    return {value: ''}
  },

  search: function(query) {
    var results = reqwest({
      url: "http://localhost:3000/search",
      data: {
        q: query
      }
    });

    return results;
  },

  updateResults: function(results) {
    this.props.updateResults(results);
  },

  handleChange: function(event) {
    var query = event.target.value;
    this.setState({value: query});

    this.search(query).then(this.updateResults);
  },

  render: function() {
    var value = this.state.value;

    return (
      <form>
        <input type="text" value={value} placeholder="Search..." onChange={this.handleChange} />
      </form>
    );
  }
});

module.exports = SearchBar;
