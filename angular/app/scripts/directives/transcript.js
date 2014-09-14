'use strict';

/**
 * @ngdoc directive
 * @name angularApp.directive:transcript
 * @description
 * # transcript
 */
angular.module('angularApp')
  .directive('transcript', function () {
    return {
      templateUrl: 'views/transcript.html',
      restrict: 'A',
      scope: {
        transcript: '=',
        time: '@',
        seek: '&'
      },
      link: function postLink($scope, $element) {
        $scope.$watch('time', function() {
          var time = $scope.time * 1000;
          var p = _.last(($scope.transcript || []).filter(function(p) {
            return p.start <= time;
          }));
          if(!p) {
            return;
          }
          $scope.activeIndex = p.elementIndex;
          var height = $element.height();
          var $p = $element.find('.caption-paragraph:eq('+p.elementIndex+')');
          $element.animate({
            scrollTop: $p.position().top + $element.scrollTop() - (height / 3),
            queue: false
          });
        });
      }
    };
  });
