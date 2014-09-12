/** @jsx React.DOM */
var React = require('react');

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.renderComponent(
  <HelloMessage name="SRG SSR Hackdays" />,
  document.getElementById('content')
);
