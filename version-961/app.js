
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getQuery(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setHeaderState() {
    const header = qs(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    const toggle = qs("[data-menu-toggle]");
    const panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
      panel.classList.toggle("is-open");
      const expanded = panel.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    qsa("[data-close-mobile]").forEach((item) => {
      item.addEventListener("click", () => {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHeroCarousel() {
    const slides = qsa("[data-hero-slide]");
    if (!slides.length) return;

    const dots = qsa("[data-hero-dot]");
    const prev = qs("[data-hero-prev]");
    const next = qs("[data-hero-next]");
    let index = 0;
    let timer = null;

    const activate = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    if (prev) prev.addEventListener("click", () => { activate(index - 1); start(); });
    if (next) next.addEventListener("click", () => { activate(index + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener("click", () => { activate(i); start(); }));

    activate(0);
    start();
  }

  function initLocalFilters() {
    const input = qs("[data-filter-input]");
    const cards = qsa("[data-filter-card]");
    if (!input || !cards.length) return;

    const total = qs("[data-filter-count]");
    const update = () => {
      const keyword = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((card) => {
        const text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();
        const visible = !keyword || text.includes(keyword);
        card.classList.toggle("hidden", !visible);
        if (visible) shown += 1;
      });
      if (total) total.textContent = String(shown);
    };

    input.addEventListener("input", update);
    update();
  }

  function initPlayer() {
    const video = qs("#movie-player");
    if (!video) return;

    const poster = video.getAttribute("data-poster") || "";
    const mp4 = video.getAttribute("data-mp4") || "";
    const hls = video.getAttribute("data-hls") || "";

    if (poster) video.setAttribute("poster", poster);

    function useMp4() {
      if (mp4 && !video.querySelector("source")) {
        const source = document.createElement("source");
        source.src = mp4;
        source.type = "video/mp4";
        video.appendChild(source);
      }
      if (!video.src && mp4) video.src = mp4;
    }

    const canUseHls = typeof window.Hls !== "undefined" && window.Hls.isSupported() && hls && !location.protocol.startsWith("file:");
    if (canUseHls) {
      const hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsPlayer.loadSource(hls);
      hlsPlayer.attachMedia(video);
      hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          useMp4();
        }
      });
    } else {
      useMp4();
    }

    const playBtn = qs("[data-play-button]");
    if (playBtn) {
      playBtn.addEventListener("click", async () => {
        try {
          await video.play();
          playBtn.classList.add("hidden");
        } catch (err) {
          // Ignore autoplay blockers; controls remain available.
        }
      });
    }

    video.addEventListener("play", () => {
      if (playBtn) playBtn.classList.add("hidden");
    });
    video.addEventListener("pause", () => {
      if (playBtn) playBtn.classList.remove("hidden");
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function highlight(text, keyword) {
    const safe = escapeHtml(text);
    if (!keyword) return safe;
    const esc = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`(${esc})`, "ig");
    return safe.replace(reg, '<mark style="background:rgba(245,158,11,.26);color:inherit;padding:0 .12em;border-radius:.2em;">$1</mark>');
  }

  function renderSearchPage() {
    const wrap = qs("[data-search-results]");
    if (!wrap || typeof window.MOVIE_CATALOG === "undefined") return;

    const input = qs("[data-search-input]");
    const count = qs("[data-search-count]");
    const sort = qs("[data-search-sort]");
    const activeTag = qs("[data-active-tag]");
    const params = new URLSearchParams(window.location.search);
    const initial = (params.get("q") || "").trim();
    if (input) input.value = initial;

    const render = () => {
      const q = (input ? input.value : initial).trim().toLowerCase();
      const mode = sort ? sort.value : "relevance";

      let items = window.MOVIE_CATALOG.slice();
      if (q) {
        items = items.filter((item) => {
          const hay = [
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.one_line
          ].join(" ").toLowerCase();
          return hay.includes(q);
        });
      }

      if (mode === "year-desc") {
        items.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title, "zh-Hans-CN"));
      } else if (mode === "year-asc") {
        items.sort((a, b) => (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title, "zh-Hans-CN"));
      } else {
        // relevance: title first, then year desc
        if (q) {
          items.sort((a, b) => {
            const aTitle = a.title.toLowerCase().includes(q) ? 1 : 0;
            const bTitle = b.title.toLowerCase().includes(q) ? 1 : 0;
            if (aTitle !== bTitle) return bTitle - aTitle;
            return (b.year || 0) - (a.year || 0);
          });
        } else {
          items.sort((a, b) => (b.year || 0) - (a.year || 0));
        }
      }

      if (count) count.textContent = String(items.length);
      if (activeTag) activeTag.textContent = q ? `关键词：${input.value.trim()}` : "全部影片";

      if (!items.length) {
        wrap.innerHTML = `
          <div class="empty-state">
            没有找到匹配的内容。请尝试使用影片名、地区、类型、年份或标签搜索。
          </div>
        `;
        return;
      }

      wrap.innerHTML = items.map((item) => `
        <a class="card" href="${item.url}">
          <div class="poster">
            <img src="${item.cover}" alt="${escapeHtml(item.title)}">
            <span class="poster-badge">${escapeHtml(item.type)}</span>
            <span class="year-badge">${item.year}</span>
          </div>
          <div class="card-body">
            <h3 class="line-clamp-2">${highlight(item.title, q)}</h3>
            <div class="meta-line">
              <span>${escapeHtml(item.region)}</span>
              <span>${escapeHtml(item.genre)}</span>
            </div>
            <p class="summary line-clamp-3">${highlight(item.one_line || "", q)}</p>
          </div>
        </a>
      `).join("");
    };

    if (input) {
      input.addEventListener("input", render);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          render();
        }
      });
    }
    if (sort) sort.addEventListener("change", render);

    qsa("[data-search-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.getAttribute("data-value") || "";
        if (input) {
          input.value = value;
          render();
        }
      });
    });

    render();
  }

  function initCategoryPageFilter() {
    const page = document.body.getAttribute("data-page");
    if (page !== "category" && page !== "home" && page !== "rank") return;
    initLocalFilters();
  }

  function initScrollToTop() {
    const btn = qs("[data-to-top]");
    if (!btn) return;
    const update = () => {
      btn.classList.toggle("hidden", window.scrollY < 500);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    setHeaderState();
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
    initPlayer();
    renderSearchPage();
    initScrollToTop();
    initCategoryPageFilter();
  });
})();
