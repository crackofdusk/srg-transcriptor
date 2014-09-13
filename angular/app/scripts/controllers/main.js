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
    player.stop();

    $scope.query = $location.search().q;

    $scope.$watch('query', _.debounce(function() {
      $scope.$apply(function() {
        $scope.active = undefined;
        stopAutoplay();
        player.stop();
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

    // DEBUG PLAYER EVENTS
    // player.addEventListener("ready", function() { console.log('ready', arguments); });
    // player.addEventListener("loaded", function() { console.log('loaded', arguments); });
    // player.addEventListener("media_seekable", function() { console.log('media_seekable', arguments); });
    // player.addEventListener("seeking_change", function() { console.log('seeking_change', arguments); });
    // player.addEventListener("playing", function() { console.log('playing', arguments); });
    // player.addEventListener("segment_change", function() { console.log('segment_change', arguments); });
    // player.addEventListener("ended", function() { console.log('ended', arguments); });
    // player.addEventListener("stopped", function() { console.log('stopped', arguments); });
    // player.addEventListener("paused", function() { console.log('paused', arguments); });

    function seek(p) {
      // console.log('seek', (+p.start - +p.duration) / 1000);
      player.seek((+p.start - +p.duration) / 1000);
      player.play();
    }
    $scope.seek = function(p) {
      // stop and clear autoplay on user interaction
      stopAutoplay();
      seek(p);
    };

    var timeout;
    var pendingParagraphs = [];
    function stopAutoplay() {
      if(timeout !== undefined) {
        clearTimeout(timeout);
      }
      pendingParagraphs = [];
    }
    player.addEventListener('paused', function() {
      stopAutoplay();
    });

    function scheduleParagraph() {
      if(timeout !== undefined) {
        clearTimeout(timeout);
      }
      if(!ready) {
        playerReadyCallback = scheduleParagraph;
        return;
      }
      var p = pendingParagraphs.shift();
      if(p) {
        // console.log('issue', p);
        seek(p);
        timeout = setTimeout(function() {
          scheduleParagraph();
        }, p.duration * 3);
      }
      else {
        player.pause();
      }
    }

    var seekable, loaded, ready, playerReadyCallback;
    function runReadyCallback() {
      ready = seekable && loaded;
      if(playerReadyCallback && ready) {
        var cb = playerReadyCallback;
        playerReadyCallback = undefined;
        cb();
      }
    }
    player.addEventListener('media_seekable', function() {
      seekable = true;
      runReadyCallback();
    });
    player.addEventListener('loaded', function() {
      loaded = true;
      seekable = false;
      runReadyCallback();
    });

    $scope.activate = function(episode, forceReload) {
      // only load new video if different episode
      if($scope.active !== episode || forceReload) {
        // console.log('stop and load video player');
        ready = seekable = loaded = false;
        player.stop();
        player.load('urn:srf:ais:video:' + episode.videoId);
      }
      $scope.active = episode;
      $scope.transcript = [];
      setTimeout(function() {
        player.getUrn(function(urn) {
          if(urn !== 'urn:srf:ais:video:' + $scope.active.videoId) {
            // console.log('reactivate', urn, 'urn:srf:ais:video:' + $scope.active.videoId);
            $scope.$apply(function() {
              $scope.activate($scope.active, true);
            });
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

        pendingParagraphs = $scope.transcript.filter(function(p) {
          return p.matches;
        });
        scheduleParagraph();
      });
    };
  });
