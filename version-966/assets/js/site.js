
(function () {
  const body = document.body;
  const nav = document.querySelector('[data-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Hero carousel
  document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const thumbs = Array.from(carousel.querySelectorAll('.hero-thumb'));
    if (!slides.length) return;
    let active = 0;
    const setActive = (idx) => {
      active = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === active));
    };
    thumbs.forEach((thumb, idx) => thumb.addEventListener('click', () => setActive(idx)));
    setInterval(() => setActive(active + 1), 5500);
    setActive(0);
  });

  // search / filter widgets
  document.querySelectorAll('[data-filter-form]').forEach((form) => {
    const cards = Array.from(document.querySelectorAll(form.getAttribute('data-target') || '.movie-card'));
    const liveCount = form.querySelector('[data-count]');
    const apply = () => {
      const q = (form.querySelector('[name="q"]')?.value || '').trim().toLowerCase();
      const type = (form.querySelector('[name="type"]')?.value || '').trim().toLowerCase();
      const region = (form.querySelector('[name="region"]')?.value || '').trim().toLowerCase();
      const year = (form.querySelector('[name="year"]')?.value || '').trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const text = (card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.tags + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year).toLowerCase();
        const ok = (!q || text.includes(q)) && (!type || card.dataset.type.toLowerCase().includes(type)) && (!region || card.dataset.region.toLowerCase().includes(region)) && (!year || card.dataset.year === year);
        card.classList.toggle('hidden', !ok);
        if (ok) shown += 1;
      });
      if (liveCount) liveCount.textContent = String(shown);
    };
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    apply();
  });

  // detail play button
  const playBtn = document.querySelector('[data-play-preview]');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const v = document.querySelector('video[data-player]');
      if (v) {
        v.play().catch(() => {});
        v.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // HLS player init
  document.querySelectorAll('video[data-player]').forEach((video) => {
    const hlsSrc = video.getAttribute('data-hls-src');
    const mp4Src = video.getAttribute('data-mp4-src');
    if (!hlsSrc) {
      if (mp4Src) video.src = mp4Src;
      return;
    }
    if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal && mp4Src && !video.src) {
          video.src = mp4Src;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsSrc;
    } else if (mp4Src) {
      video.src = mp4Src;
    }
  });

  // back to top
  const back = document.querySelector('[data-backtop]');
  if (back) {
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
