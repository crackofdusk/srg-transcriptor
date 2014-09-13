/** @jsx React.DOM */

var React = require('react');

var VideoLibrary = require('./components/video-library');

React.renderComponent(
  <VideoLibrary />,
  document.getElementById('content')
);

window.React = React;
