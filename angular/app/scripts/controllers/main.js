'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    var player = SRG.PlayerManager.getPlayer('player');
    $scope.query = $location.search().q;

    $scope.$watch('query', _.debounce(function() {
      $scope.$apply(function() {
        $scope.active = undefined;
        player.stop();
        if(timeout !== undefined) {
          clearTimeout(timeout);
        }
        $location.search('q', $scope.query).replace();
        $http({
          url: '/search',
          params: {q: $scope.query}
        }).success(function(data, status, headers, config) {
          if(config.params.q !== $scope.query) {
            // race, outdated
            return;
          }
          $scope.shows = data;
          var result = data[0].episodes[0];
          if(result && result.matches) {
            $scope.activate(result);
          }
        });
      });
    }), 200);

    $scope.seek = function(p) {
      if(timeout !== undefined) {
        clearTimeout(timeout);
      }
      player.seek((+p.start - +p.duration) / 1000);
    };

    var timeout;
    $scope.activate = function(episode) {
      $scope.active = episode;
      $scope.transcript = [];
      player.load('urn:srf:ais:video:' + episode.videoId);
      player.play();
      setTimeout(function() {
        player.getUrn(function(urn) {
          if(urn !== 'urn:srf:ais:video:' + $scope.active.videoId) {
            // console.log('reactivate', urn, 'urn:srf:ais:video:' + $scope.active.videoId);
            $scope.activate($scope.active);
          }
        });
      }, 1000);

      var query = new RegExp(
        $scope.query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
        'gi'
      );

      $http.get('/'+episode.transcript).success(function(data) {
        $scope.transcript = d3.tsv.parse(data);
        $scope.transcript.forEach(function(p) {
          p.matches = p.text.match(query);

          p.matchText = p.text.replace(query, '<mark>$&</mark>');
        });

        var pendingParagraphs = $scope.transcript.filter(function(p) {
          return p.matches;
        });
        function scheduleParagraph() {
          if(timeout !== undefined) {
            clearTimeout(timeout);
          }
          var p = pendingParagraphs.shift();
          if(p) {
            $scope.seek(p);
            timeout = setTimeout(function() {
              scheduleParagraph();
            }, p.duration * 3);
          }
          else {
            player.pause();
          }
        }
        scheduleParagraph();
      });
    };
  });
