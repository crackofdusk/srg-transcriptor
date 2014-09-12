/** @jsx React.DOM */

var React = require('react');

module.exports = React.createClass({
  render: function() {
    var imageSource = "";
    var title = "Title";
    var searchContext = "some text here including the search terms";

    return (
      <div>
        <img src={imageSource} />
        <h3>{title}</h3>
        <p>{searchContext}</p>
      </div>
    );
  }
});
