(function () {
  function q(selector, root) { return (root || document).querySelector(selector); }
  function qa(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function initBackTop() {
    const btn = q('[data-backtop]');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btn.classList.toggle('hidden', window.scrollY < 500);
    });
  }

  function applyPosterFallbacks() {
    qa('[data-cover]').forEach(slot => {
      const src = slot.getAttribute('data-cover');
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const bg = slot.querySelector('.poster-bg');
        if (bg) {
          bg.innerHTML = '';
          bg.style.backgroundImage = `url(${src})`;
          bg.style.backgroundSize = 'cover';
          bg.style.backgroundPosition = 'center';
        }
        slot.classList.add('has-image');
      };
      img.onerror = () => {};
      img.src = src;
    });
  }

  function initHeroSlider() {
    const slider = q('[data-hero-slider]');
    if (!slider) return;
    const slides = qa('.slide', slider);
    if (!slides.length) return;
    let index = 0;
    const show = (i) => {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
      const dots = qa('[data-hero-dot]', slider);
      dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    };
    const go = (dir) => {
      index = (index + dir + slides.length) % slides.length;
      show(index);
    };
    show(0);
    const prev = q('[data-hero-prev]', slider);
    const next = q('[data-hero-next]', slider);
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    qa('[data-hero-dot]', slider).forEach((dot, idx) => dot.addEventListener('click', () => { index = idx; show(index); }));
    setInterval(() => { if (!document.hidden) go(1); }, 6000);
  }

  function initCardFilters() {
    const panel = q('[data-filter-panel]');
    if (!panel) return;
    const cards = qa('[data-card]');
    const input = q('[data-search-input]');
    const year = q('[data-year-filter]');
    const type = q('[data-type-filter]');
    const genre = q('[data-genre-filter]');
    const chips = qa('[data-chip-filter]');
    const total = q('[data-result-count]');

    function matches(card) {
      const term = (input?.value || '').trim().toLowerCase();
      const y = (year?.value || '').trim();
      const t = (type?.value || '').trim();
      const g = (genre?.value || '').trim();
      const activeChip = panel.querySelector('[data-chip-filter].active');
      const chip = activeChip ? activeChip.getAttribute('data-chip-filter') : '';
      const hay = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.summary, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
      if (term && !hay.includes(term)) return false;
      if (y && card.dataset.year !== y) return false;
      if (t && card.dataset.type !== t) return false;
      if (g && !(card.dataset.genre || '').includes(g) && !(card.dataset.tags || '').includes(g)) return false;
      if (chip && chip !== 'all' && !(card.dataset.genre || '').includes(chip) && !(card.dataset.tags || '').includes(chip) && card.dataset.type !== chip) return false;
      return true;
    }

    function render() {
      let count = 0;
      cards.forEach(card => {
        const ok = matches(card);
        card.style.display = ok ? '' : 'none';
        if (ok) count++;
      });
      if (total) total.textContent = String(count);
    }

    input && input.addEventListener('input', render);
    year && year.addEventListener('change', render);
    type && type.addEventListener('change', render);
    genre && genre.addEventListener('change', render);
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      render();
    }));
    render();
  }

  function initPlayers() {
    qa('[data-hls]').forEach(video => {
      const src = video.getAttribute('data-hls');
      if (!src) return;
      function attachNative(url) {
        if (!video.src) video.src = url;
      }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            attachNative(src);
            try { hls.destroy(); } catch (e) {}
          }
        });
      } else {
        attachNative(src);
      }
    });
  }

  function initSearchPage() {
    const page = q('[data-search-page]');
    if (!page || !window.SEARCH_INDEX) return;
    const input = q('[data-search-query]');
    const results = q('[data-search-results]');
    const total = q('[data-search-total]');
    function render(items) {
      if (!results) return;
      results.innerHTML = items.map(item => `
        <a class="card" href="${item.path}">
          <div class="cover poster" data-cover="${item.cover}">
            <div class="poster-bg"></div>
            <div class="poster-fallback">
              <strong>${item.title}</strong>
              <span>${item.type} · ${item.year} · ${item.region}</span>
            </div>
          </div>
          <div class="content">
            <h3>${item.title}</h3>
            <div class="row"><span class="pill">${item.type}</span><span class="pill">${item.year}</span><span class="pill">${item.region}</span></div>
            <p class="excerpt">${item.oneLine}</p>
          </div>
        </a>
      `).join('');
      applyPosterFallbacks();
      if (total) total.textContent = String(items.length);
    }
    function doSearch() {
      const q = (input?.value || '').trim().toLowerCase();
      const filtered = !q ? window.SEARCH_INDEX : window.SEARCH_INDEX.filter(item => {
        const hay = [item.title, item.type, item.year, item.region, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return hay.includes(q);
      });
      render(filtered.slice(0, 120));
    }
    input && input.addEventListener('input', doSearch);
    doSearch();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyPosterFallbacks();
    initHeroSlider();
    initCardFilters();
    initPlayers();
    initSearchPage();
    initBackTop();
  });
})();
