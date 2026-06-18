(function () {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const hero = document.querySelector(".hero-shell");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    let index = 0;

    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  const bindSearch = function (scope) {
    const input = scope.querySelector(".site-search");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const empty = scope.querySelector(".empty-state");
    const chips = Array.from(scope.querySelectorAll(".filter-chip"));
    let activeFilter = "all";

    if (!input && chips.length === 0) {
      return;
    }

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = ((card.dataset.title || "") + " " + (card.dataset.meta || "")).toLowerCase();
        const filterText = (card.dataset.filter || "").toLowerCase();
        const passQuery = query === "" || haystack.indexOf(query) !== -1;
        const passFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1 || haystack.indexOf(activeFilter) !== -1;
        const shouldShow = passQuery && passFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = (chip.dataset.filter || "all").toLowerCase();
        apply();
      });
    });
  };

  document.querySelectorAll("[data-search-scope]").forEach(bindSearch);
})();

function initMoviePlayer(videoId, overlayId, source) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !source) {
    return;
  }

  let attached = false;
  let hlsInstance = null;

  const reveal = function () {
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  };

  const playVideo = function () {
    reveal();
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };

  const attach = function () {
    if (attached) {
      playVideo();
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.load();
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      return;
    }

    video.src = source;
    video.load();
    playVideo();
  };

  if (overlay) {
    overlay.addEventListener("click", attach);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      attach();
    }
  });

  video.addEventListener("play", reveal);

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
