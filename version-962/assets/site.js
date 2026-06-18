(function () {
    "use strict";

    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function collectValues(cards, key) {
        var values = [];
        var seen = Object.create(null);
        cards.forEach(function (card) {
            var value = card.getAttribute(key) || "";
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });
        values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-Hans-CN");
        });
        return values;
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var scope = form.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            if (!cards.length) {
                return;
            }
            var input = form.querySelector("[data-filter-input]");
            var regionSelect = form.querySelector("[data-filter-region]");
            var typeSelect = form.querySelector("[data-filter-type]");
            var yearSelect = form.querySelector("[data-filter-year]");
            var count = form.querySelector("[data-result-count]");
            var empty = scope.querySelector("[data-empty-state]");

            fillSelect(regionSelect, collectValues(cards, "data-region"));
            fillSelect(typeSelect, collectValues(cards, "data-type"));
            fillSelect(yearSelect, collectValues(cards, "data-year"));

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query && input) {
                input.value = query;
            }

            function applyFilter() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (term && haystack.indexOf(term) === -1) {
                        ok = false;
                    }
                    if (region && card.getAttribute("data-region") !== region) {
                        ok = false;
                    }
                    if (type && card.getAttribute("data-type") !== type) {
                        ok = false;
                    }
                    if (year && card.getAttribute("data-year") !== year) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部";
                }
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter();
            });
            applyFilter();
        });
    }

    function initPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("[data-video]");
            var button = player.querySelector("[data-play-button]");
            var source = player.getAttribute("data-src") || "";
            var started = false;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            function start() {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                player.classList.add("is-playing");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                } else {
                    video.src = source;
                    video.load();
                    playVideo();
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    onReady(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
