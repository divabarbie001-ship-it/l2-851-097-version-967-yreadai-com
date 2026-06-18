(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initMobileMenu() {
    const toggle = qs('[data-mobile-toggle]');
    const panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    });
  }

  function initHeroSearch() {
    qsa('[data-search-go]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = (qs('[data-search-mini]')?.value || '').trim();
        const url = new URL(btn.getAttribute('data-target') || '/search.html', window.location.href);
        if (value) url.searchParams.set('q', value);
        window.location.href = url.pathname + url.search;
      });
    });

    const mini = qs('[data-search-mini]');
    if (mini) {
      mini.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          qs('[data-search-go]')?.click();
        }
      });
    }
  }

  function initSearchFilters() {
    const input = qs('[data-filter-input]');
    const typeSelect = qs('[data-filter-type]');
    const regionSelect = qs('[data-filter-region]');
    const yearSelect = qs('[data-filter-year]');
    const countNode = qs('[data-result-count]');
    const emptyNode = qs('[data-empty]');
    const cards = qsa('[data-filter-card]');
    if (!input && !typeSelect && !regionSelect && !yearSelect) return;

    const params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) input.value = params.get('q');

    function matchesCard(card) {
      const title = (card.dataset.title || '').toLowerCase();
      const tags = (card.dataset.tags || '').toLowerCase();
      const summary = (card.dataset.summary || '').toLowerCase();
      const oneLine = (card.dataset.oneLine || '').toLowerCase();
      const region = (card.dataset.region || '').toLowerCase();
      const type = (card.dataset.type || '').toLowerCase();
      const year = card.dataset.year || '';
      const query = (input?.value || '').trim().toLowerCase();

      if (query && !(title.includes(query) || tags.includes(query) || summary.includes(query) || oneLine.includes(query))) {
        return false;
      }
      if (typeSelect && typeSelect.value && type !== typeSelect.value.toLowerCase()) return false;
      if (regionSelect && regionSelect.value && region !== regionSelect.value.toLowerCase()) return false;
      if (yearSelect && yearSelect.value && year !== yearSelect.value) return false;
      return true;
    }

    function update() {
      let visible = 0;
      cards.forEach((card) => {
        const show = matchesCard(card);
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      if (countNode) countNode.textContent = String(visible);
      if (emptyNode) emptyNode.classList.toggle('hidden', visible !== 0);
    }

    [input, typeSelect, regionSelect, yearSelect].filter(Boolean).forEach((el) => {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    update();
  }

  function initVideoPlayers() {
    qsa('video[data-hls], video[data-mp4]').forEach((video) => {
      const mp4 = video.dataset.mp4;
      const hls = video.dataset.hls;
      const preferHls = hls && (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls);
      if (window.Hls && hls && !video.canPlayType('application/vnd.apple.mpegurl')) {
        const hlsPlayer = new window.Hls();
        hlsPlayer.loadSource(hls);
        hlsPlayer.attachMedia(video);
        video.__hlsPlayer = hlsPlayer;
      } else if (preferHls && hls) {
        video.src = hls;
      } else if (mp4) {
        video.src = mp4;
      }

      const cover = video.closest('.player-box, .detail-player');
      qsa('[data-play-trigger]', cover || document).forEach((btn) => {
        btn.addEventListener('click', () => {
          video.play().catch(() => {});
        });
      });
    });
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('hidden', window.scrollY < 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initYearSelects() {
    qsa('[data-year-select]').forEach((select) => {
      const years = Array.from(new Set(qsa('[data-filter-card]').map ? [] : []));
      void years;
    });
  }

  initMobileMenu();
  initHeroSearch();
  initSearchFilters();
  initVideoPlayers();
  initBackToTop();
})();