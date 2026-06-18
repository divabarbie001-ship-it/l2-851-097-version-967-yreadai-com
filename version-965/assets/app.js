(function () {
  var header = document.querySelector('[data-header]');
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var search = scope.querySelector('[data-search]');
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var clear = scope.querySelector('[data-clear]');
    var empty = scope.querySelector('[data-empty]');

    function valueOf(filterName, card) {
      return (card.getAttribute('data-' + filterName) || '').toLowerCase();
    }

    function update() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
        var pass = !query || text.indexOf(query) !== -1;

        filters.forEach(function (filter) {
          var filterValue = filter.value.trim().toLowerCase();
          var filterName = filter.getAttribute('data-filter');
          if (filterValue && valueOf(filterName, card) !== filterValue) {
            pass = false;
          }
        });

        card.hidden = !pass;
        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', update);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', update);
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        filters.forEach(function (filter) {
          filter.value = '';
        });
        update();
      });
    }
  });
})();
