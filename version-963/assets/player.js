(function () {
  function bindPlayer(root) {
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var playlistUrl = root.getAttribute("data-video");
    var activated = false;
    var hlsInstance = null;

    function attach() {
      if (activated || !video || !playlistUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playlistUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playlistUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playlistUrl;
      }
      root.hlsInstance = hlsInstance;
      activated = true;
    }

    function play() {
      attach();
      root.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!activated) {
          play();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".js-player").forEach(bindPlayer);
  });
})();
