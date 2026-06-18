(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function() {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function(root) {
      var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(root.querySelectorAll('[data-slide-dot]'));
      var prev = root.querySelector('[data-slide-prev]');
      var next = root.querySelector('[data-slide-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = setInterval(function() {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) clearInterval(timer);
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(Number(dot.getAttribute('data-slide-dot')) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function() {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function() {
          show(index + 1);
          start();
        });
      }

      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var region = scope.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';

      if (input && initial) {
        input.value = initial;
      }

      function match(card) {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        var r = region ? region.value : '';
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        return (!q || title.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t) && (!r || cardRegion === r);
      }

      function apply() {
        cards.forEach(function(card) {
          card.classList.toggle('is-hidden', !match(card));
        });
      }

      [input, year, type, region].forEach(function(control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  });
})();
