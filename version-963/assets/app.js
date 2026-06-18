(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".js-mobile-toggle");
    var panel = document.querySelector(".js-mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.hidden = !panel.hidden;
    });
  }

  function setHero(index) {
    var slides = document.querySelectorAll("[data-hero-slide]");
    var dots = document.querySelectorAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    slides.forEach(function (slide) {
      slide.classList.toggle("is-active", Number(slide.getAttribute("data-hero-slide")) === index);
    });
    dots.forEach(function (dot) {
      dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
    });
  }

  function initHero() {
    var slides = document.querySelectorAll("[data-hero-slide]");
    var dots = document.querySelectorAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        index = Number(dot.getAttribute("data-hero-dot"));
        setHero(index);
      });
    });
    window.setInterval(function () {
      index = (index + 1) % slides.length;
      setHero(index);
    }, 5200);
  }

  function initGlobalSearch() {
    var movies = window.SITE_MOVIES || [];
    var inputs = document.querySelectorAll(".js-site-search");
    inputs.forEach(function (input) {
      var holder = input.parentElement ? input.parentElement.querySelector(".js-search-results") : null;
      if (!holder) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          holder.hidden = true;
          holder.innerHTML = "";
          return;
        }
        var matches = movies
          .filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags]
              .join(" ")
              .toLowerCase()
              .indexOf(query) !== -1;
          })
          .slice(0, 12);
        if (!matches.length) {
          holder.hidden = false;
          holder.innerHTML = "<div class=\"search-empty\">暂无匹配内容</div>";
          return;
        }
        holder.hidden = false;
        holder.innerHTML = matches
          .map(function (movie) {
            return "<a href=\"" + escapeHtml(movie.url) + "\">" +
              "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
              "<span><strong>" + escapeHtml(movie.title) + "</strong>" +
              "<small>" + escapeHtml(movie.region + " · " + movie.type + " · " + movie.year + " · " + movie.category) + "</small></span>" +
              "</a>";
          })
          .join("");
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement || !input.parentElement.contains(event.target)) {
          holder.hidden = true;
        }
      });
    });
  }

  function initLocalFilter() {
    var scopes = document.querySelectorAll(".filter-scope");
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".js-filter-input");
      var cards = scope.querySelectorAll("[data-card]");
      var empty = scope.querySelector(".js-filter-empty");
      if (!input || !cards.length) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
  });
})();
