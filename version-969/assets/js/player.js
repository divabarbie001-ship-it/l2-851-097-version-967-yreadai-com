function initMoviePlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hls = null;

  function load() {
    if (loaded || !video) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function play() {
    load();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function() {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
