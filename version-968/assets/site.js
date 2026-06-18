
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function hashString(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function colorsFor(text) {
    var h = hashString(text);
    var hue = h % 360;
    return {
      a: 'hsl(' + hue + ' 72% 44%)',
      b: 'hsl(' + ((hue + 38) % 360) + ' 76% 30%)',
      c: 'hsl(' + ((hue + 74) % 360) + ' 68% 52%)',
      d: 'hsl(' + ((hue + 110) % 360) + ' 80% 18%)'
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(title) {
    var clean = String(title || '').replace(/\s+/g, '');
    var out = '';
    for (var i = 0; i < clean.length; i++) {
      var ch = clean[i];
      if (/[\u4e00-\u9fffA-Za-z0-9]/.test(ch)) {
        out += ch;
      }
      if (out.length >= 2) break;
    }
    return out || '影';
  }

  function shortText(text, limit) {
    var out = String(text || '').replace(/\s+/g, ' ').trim();
    if (out.length <= limit) return out;
    return out.slice(0, limit) + '…';
  }

  function movieCard(item, href, compact) {
    var c = colorsFor(item.title);
    var tags = [];
    if (item.year) tags.push(item.year);
    if (item.region) tags.push(item.region);
    if (item.type) tags.push(item.type);
    if (item.genre) tags.push(item.genre);
    var tagHtml = tags.slice(0, compact ? 2 : 3).map(function (t) {
      return '<span class="badge">' + escapeHtml(t) + '</span>';
    }).join('');
    var summary = compact ? '' : '<div class="summary">' + escapeHtml(shortText(item.summary || item.one_line || item.review || '', 84)) + '</div>';
    return (
      '<article class="movie-card" data-title="' + escapeHtml(item.title + ' ' + item.region + ' ' + item.genre + ' ' + item.tags + ' ' + item.type + ' ' + item.year) + '" style="--card-a:' + c.a + ';--card-b:' + c.b + ';--card-c:' + c.c + ';--card-d:' + c.d + '">' +
        '<a href="' + escapeHtml(href) + '">' +
          '<div class="poster">' +
            '<span class="year-badge">' + escapeHtml(item.year || '') + '</span>' +
            '<div class="letters">' + escapeHtml(initials(item.title)) + '</div>' +
          '</div>' +
        '</a>' +
        '<div class="body">' +
          '<h3><a href="' + escapeHtml(href) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<div class="meta">' + escapeHtml((item.region || '') + ' · ' + (item.type || '') + ' · ' + (item.genre || '')) + '</div>' +
          summary +
          '<div class="meta-row">' + tagHtml + '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function miniCard(item, href) {
    var c = colorsFor(item.title);
    return (
      '<a class="mini-item" href="' + escapeHtml(href) + '" style="--card-a:' + c.a + ';--card-b:' + c.b + ';--card-c:' + c.c + '">' +
        '<div class="mini-poster">' + escapeHtml(initials(item.title)) + '</div>' +
        '<div>' +
          '<h4>' + escapeHtml(item.title) + '</h4>' +
          '<p>' + escapeHtml(shortText(item.one_line || item.summary || item.review || '', 68)) + '</p>' +
        '</div>' +
      '</a>'
    );
  }

  window.MovieSite = {
    colorsFor: colorsFor,
    escapeHtml: escapeHtml,
    initials: initials,
    shortText: shortText,
    movieCard: movieCard,
    miniCard: miniCard
  };

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHeroCarousel() {
    var root = qs('[data-hero-carousel]');
    if (!root) return;
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-slide-dot]', root);
    var prev = qs('[data-prev]', root);
    var next = qs('[data-next]', root);
    if (!slides.length) return;
    var index = 0;
    for (var i = 0; i < slides.length; i++) {
      if (slides[i].classList.contains('is-active')) {
        index = i;
        break;
      }
    }
    var timer;
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        slide.classList.toggle('is-active', n === index);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle('is-active', n === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () {
        show(n);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(index);
    start();
  }

  function initLocalFilters() {
    qsa('[data-filter-section]').forEach(function (section) {
      var input = qs('[data-filter-input]', section);
      var items = qsa('[data-filter-item]', section);
      var count = qs('[data-filter-count]', section);
      if (!input || !items.length) return;
      function apply() {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var text = (item.getAttribute('data-title') || item.textContent || '').toLowerCase();
          var show = !q || text.indexOf(q) !== -1;
          item.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (count) count.textContent = visible;
      }
      input.addEventListener('input', apply);
      apply();
    });
  }

  function initPlayer() {
    var root = qs('[data-player]');
    if (!root) return;
    var video = qs('video', root);
    if (!video) return;
    var play = qs('[data-play]', root);
    var sources = qsa('[data-source]', root);
    var hint = qs('[data-source-hint]', root);

    function activate(btn) {
      sources.forEach(function (el) { el.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var src = btn.getAttribute('data-src');
      var label = btn.getAttribute('data-label') || btn.textContent;
      if (src) {
        video.src = src;
        video.load();
      }
      if (hint) hint.textContent = label ? ('当前线路：' + label) : '当前线路已切换';
    }

    sources.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn);
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      });
    });

    if (play) {
      play.addEventListener('click', function () {
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        var p = video.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function initSearchPage() {
    var app = qs('[data-search-app]');
    if (!app || !window.SITE_INDEX) return;
    var input = qs('[data-search-input]', app);
    var region = qs('[data-search-region]', app);
    var type = qs('[data-search-type]', app);
    var genre = qs('[data-search-genre]', app);
    var results = qs('[data-search-results]', app);
    var pager = qs('[data-search-pager]', app);
    var summary = qs('[data-search-summary]', app);
    var pageSize = 48;
    var current = 1;
    var dataset = window.SITE_INDEX.slice();

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) input.value = params.get('q');

    function filtered() {
      var q = (input.value || '').trim().toLowerCase();
      var r = region.value;
      var t = type.value;
      var g = genre.value;
      return dataset.filter(function (item) {
        if (r && item.region !== r) return false;
        if (t && item.type !== t) return false;
        if (g && item.genre.indexOf(g) === -1) return false;
        if (!q) return true;
        var hay = [
          item.title, item.region, item.type, item.genre, item.tags, item.year, item.summary, item.one_line
        ].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
    }

    function renderPager(totalPages) {
      pager.innerHTML = '';
      if (totalPages <= 1) return;
      var makeBtn = function (label, page, active) {
        var b = document.createElement('button');
        b.textContent = label;
        if (active) b.className = 'is-active';
        b.addEventListener('click', function () {
          current = page;
          render();
          window.scrollTo({ top: app.offsetTop - 90, behavior: 'smooth' });
        });
        return b;
      };
      if (current > 1) pager.appendChild(makeBtn('上一页', current - 1, false));
      var start = Math.max(1, current - 2);
      var end = Math.min(totalPages, current + 2);
      if (start > 1) pager.appendChild(makeBtn('1', 1, current === 1));
      if (start > 2) {
        var span = document.createElement('span');
        span.textContent = '…';
        span.style.color = 'var(--muted)';
        pager.appendChild(span);
      }
      for (var i = start; i <= end; i++) pager.appendChild(makeBtn(String(i), i, i === current));
      if (end < totalPages - 1) {
        var span2 = document.createElement('span');
        span2.textContent = '…';
        span2.style.color = 'var(--muted)';
        pager.appendChild(span2);
      }
      if (end < totalPages) pager.appendChild(makeBtn(String(totalPages), totalPages, current === totalPages));
      if (current < totalPages) pager.appendChild(makeBtn('下一页', current + 1, false));
    }

    function render() {
      var list = filtered();
      var total = list.length;
      var pages = Math.max(1, Math.ceil(total / pageSize));
      current = Math.min(current, pages);
      var slice = list.slice((current - 1) * pageSize, current * pageSize);
      summary.textContent = '共找到 ' + total + ' 部影片，当前显示第 ' + current + ' / ' + pages + ' 页。';
      results.innerHTML = slice.map(function (item) {
        return window.MovieSite.movieCard(item, item.href, true);
      }).join('');
      renderPager(pages);
      if (total === 0) {
        results.innerHTML = '<div class="hero-panel"><h3>没有找到匹配内容</h3><p>请尝试换一个关键词、地区或类型。</p></div>';
      }
    }

    input.addEventListener('input', function () { current = 1; render(); });
    region.addEventListener('change', function () { current = 1; render(); });
    type.addEventListener('change', function () { current = 1; render(); });
    genre.addEventListener('change', function () { current = 1; render(); });
    render();
  }

  function initBackToTop() {
    var btn = qs('[data-backtop]');
    if (!btn) return;
    function update() {
      if (window.scrollY > 400) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeroCarousel();
    initLocalFilters();
    initPlayer();
    initSearchPage();
    initBackToTop();
  });
})();
