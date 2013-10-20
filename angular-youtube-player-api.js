angular.module('youtube', ['ng']).run(function () {
    var tag = document.createElement('script');

    // This is a protocol-relative URL as described here:
    //     http://paulirish.com/2010/the-protocol-relative-url/
    // If you're testing a local page accessed via a file:/// URL, please set tag.src to
    //     "https://www.youtube.com/iframe_api" instead.
    tag.src = "//www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    })
    .service('youtubePlayerApi', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
        var service = $rootScope.$new(true);

        // Youtube callback when API is ready
        $window.onYouTubeIframeAPIReady = function () {
            $log.info('Youtube API is ready');
            service.__ready = true;
            for (var i = 0; i < service.__callOnReady.length; i++) {
              fn = service.__callOnReady[i]
              fn()
            }
        };

        service.__callOnReady = []
        service.ready = function(fn) {
          if (service.__ready) {
            fn()
          } else {
            service.__callOnReady.push(fn)
          }
        }

        service.bindVideoPlayer = function (elementId) {
            $log.info('Binding to player ' + elementId);
            service.playerId = elementId;
        };

        service.createPlayer = function (options) {
            $log.info('Creating a new Youtube player for DOM id ' + this.playerId + ' and video ' + options.videoId);
            var player = new YT.Player(this.playerId, options);
            player.getState = function() {
              var numState = player.getPlayerState()
              var states = "ENDED PLAYING PAUSED BUFFERING CUED UNSTARTED".split(" ")
              for (var i = 0; i < states.length; i++) {
                var state = states[i]
                if (YT.PlayerState[state] == numState) {
                  return state
                }
              }
            }
            return player
        };

        service.loadPlayer = function () {
            // API ready?
            if (this.__ready && this.playerId && this.videoId) {
                if(this.player) {
                    this.player.destroy();
                }

                this.player = this.createPlayer();
            }
        };

        return service;
    }])
    .directive('youtubePlayer', ['youtubePlayerApi', function (youtubePlayerApi) {
        return {
            restrict:'A',
            link:function (scope, element) {
                youtubePlayerApi.bindVideoPlayer(element[0].id);
            }
        };
    }]);
