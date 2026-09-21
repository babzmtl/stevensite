(function () {
  "use strict";

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // Home hero parallax: the photo travels at ~25% of the page's scroll speed, so the
  // About text slides over it. Tune RATE: 0 = photo scrolls with the page, 1 = photo stays fixed.
  var heroBg = document.querySelector(".top-bg");
  if (heroBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var RATE = 0.75, ticking = false, heroSection = heroBg.parentElement;
    var paint = function () {
      var y = Math.min(window.scrollY, heroSection.offsetHeight);
      heroBg.style.transform = "translate3d(0," + (y * RATE) + "px,0)";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  // Page-switch veil: the site backdrop shows for a moment while moving between pages.
  // (The <html class="veil"> flag is set by a tiny inline script in each page's <head>.)
  var VEIL_HOLD = 400;   // ms the backdrop stays after a page has loaded (0.4 s)
  var veil = document.querySelector(".page-veil");
  if (veil) {
    var root = document.documentElement, revealed = false;
    var reveal = function () {
      if (revealed) return;
      revealed = true;
      setTimeout(function () { root.classList.remove("veil"); veil.classList.remove("show"); }, VEIL_HOLD);
    };
    if (document.readyState === "complete") { reveal(); } else { window.addEventListener("load", reveal); }
    setTimeout(reveal, 2500);                                   // never hold the page hostage
    window.addEventListener("pageshow", function (e) {          // back/forward cache
      if (e.persisted) { root.classList.remove("veil"); veil.classList.remove("show"); }
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      var href = a.getAttribute("href");
      if (!/^[\w-]+\.html$/.test(href)) return;                 // internal page links only
      if ((location.pathname.split("/").pop() || "index.html") === href) return;
      e.preventDefault();
      veil.classList.add("show");
      setTimeout(function () { location.href = href; }, 250);
    });
  }

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Custom audio player(s)
  function fmt(t) {
    if (!isFinite(t)) return "00:00";
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  document.querySelectorAll("[data-player]").forEach(function (p) {
    var audio = p.querySelector("audio");
    var btn = p.querySelector(".play");
    var seek = p.querySelector(".seek");
    var cur = p.querySelector(".cur");
    var dur = p.querySelector(".dur");

    btn.addEventListener("click", function () {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });
    audio.addEventListener("play",  function () { btn.classList.add("playing");  btn.setAttribute("aria-label", "Pause"); });
    audio.addEventListener("pause", function () { btn.classList.remove("playing"); btn.setAttribute("aria-label", "Play"); });
    audio.addEventListener("loadedmetadata", function () { dur.textContent = fmt(Math.round(audio.duration)); });
    audio.addEventListener("timeupdate", function () {
      cur.textContent = fmt(audio.currentTime);
      if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
    });
    audio.addEventListener("ended", function () { btn.classList.remove("playing"); seek.value = 0; });
    seek.addEventListener("input", function () {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    });
  });

  // YouTube embeds: <div class="yt" data-id="VIDEO_ID"> becomes a player once a real ID is set.
  // YouTube refuses to play when the page sends no Referer ("Error 153"). That happens when a page is
  // opened straight from disk (file://), so there we show a poster that opens the video on YouTube instead.
  document.querySelectorAll(".yt[data-id]").forEach(function (el) {
    var id = el.getAttribute("data-id");
    if (!id || id === "YOUR_VIDEO_ID") return;          // keep the placeholder
    var title = el.getAttribute("data-title") || "Video";

    if (location.protocol === "file:") {
      var a = document.createElement("a");
      a.className = "yt-poster";
      a.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
      a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("aria-label", "Watch " + title + " on YouTube");
      a.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg")';
      a.innerHTML = '<span class="yt-play"></span><small>Local file preview: plays inline once the site is hosted</small>';
      el.textContent = "";
      el.appendChild(a);
      return;
    }

    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id);
    f.title = title;
    f.loading = "lazy";
    f.referrerPolicy = "strict-origin-when-cross-origin";   // YouTube needs a Referer to identify the site
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
    f.allowFullscreen = true;
    el.textContent = "";
    el.appendChild(f);
  });

  // Contact form: validate, then submit via fetch (works with Formspree)
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        var bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
        el.classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { status.textContent = "Please fill in the required fields (*)."; return; }

      // Not connected yet: tell the site owner instead of failing silently
      if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
        status.textContent = "This form isn't connected yet: add your Formspree form ID in contact.html.";
        return;
      }

      status.textContent = "Sending…";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          form.reset();
          status.textContent = "Thanks! Your message has been sent.";
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please try again later.";
        });
    });
  }
})();
