/* ============================================================
   Achinsky Construction Company — site behavior
   Vanilla JS, no build step.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.ACHINSKY_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme (remembers choice, respects OS default) ---------- */
  var root = document.documentElement;
  var themeBtn = $("#themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  var saved = null;
  try { saved = localStorage.getItem("achinsky-theme"); } catch (e) {}
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("achinsky-theme", next); } catch (e) {}
    });
  }

  /* ---------- Header: stuck state + scroll progress ---------- */
  var header = $("#siteHeader");
  var progress = $("#scrollProgress");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menuBtn");
  var nav = $("#nav");

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add("in"); }, Math.min(i * 70, 350));
        revealIO.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { revealIO.observe(el); });

    // Safety net: if the observer never fires (odd browser, print, in-page search),
    // force everything visible rather than leaving the page blank.
    setTimeout(function () {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }, 4000);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated stat counters ---------- */
  var stats = $$(".stat-num");
  function countUp(el) {
    if (el.dataset.plain === "1") return;          // years like "2006" stay static
    var target = parseFloat(el.dataset.count) || 0;
    var suffix = el.dataset.suffix || "";
    var dur = 1300;
    var start = performance.now();

    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        statIO.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { statIO.observe(el); });
  } else {
    stats.forEach(function (el) {
      if (el.dataset.plain !== "1") {
        el.textContent = (el.dataset.count || "") + (el.dataset.suffix || "");
      }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = $$("main section[id]");
  var navLinks = $$(".nav > a[href^='#']");
  if ("IntersectionObserver" in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Missing-photo placeholders ---------- */
  function placeholderFor(label) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="none"/>' +
      '<g fill="none" stroke="%231B4FA8" stroke-width="6" stroke-linecap="round" opacity=".55">' +
      '<path d="M120 200h160M140 200v-70l60-40 60 40v70M175 200v-42h50v42"/></g>' +
      '<text x="200" y="248" text-anchor="middle" font-family="Inter,sans-serif" ' +
      'font-size="17" fill="%235A6B87">' + label + '</text></svg>';
    return "data:image/svg+xml;charset=UTF-8," + svg.replace(/#/g, "%23");
  }

  $$(".shot img").forEach(function (img) {
    img.addEventListener("error", function () {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = "1";
      img.classList.add("is-placeholder");
      var name = img.closest("figure").querySelector("strong");
      img.src = placeholderFor("Add photo: " + (name ? name.textContent : "project"));
    });
    // Trigger for images already failed before this script ran
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event("error"));
    }
  });

  /* ---------- Project filter ---------- */
  var shots = $$(".shot");
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.dataset.filter;
      $$(".filter").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      shots.forEach(function (s) {
        s.classList.toggle("is-hidden", cat !== "all" && s.dataset.cat !== cat);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbCap = $("#lbCaption");
  var lbIndex = 0;
  var lastFocused = null;

  function visibleShots() {
    return shots.filter(function (s) { return !s.classList.contains("is-hidden"); });
  }

  function showAt(i) {
    var list = visibleShots();
    if (!list.length) return;
    lbIndex = (i + list.length) % list.length;
    var fig = list[lbIndex];
    var img = fig.querySelector("img");
    var strong = fig.querySelector("strong");
    var span = fig.querySelector("figcaption span");
    lbImg.src = img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = (strong ? strong.textContent : "") +
      (span ? " — " + span.textContent : "");
  }

  function openLightbox(fig) {
    lastFocused = document.activeElement;
    showAt(visibleShots().indexOf(fig));
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    $("#lbClose").focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.src = "";
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  shots.forEach(function (fig) {
    fig.addEventListener("click", function () { openLightbox(fig); });
  });

  if (lb) {
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", function () { showAt(lbIndex - 1); });
    $("#lbNext").addEventListener("click", function () { showAt(lbIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "ArrowLeft") showAt(lbIndex - 1);
      if (e.key === "ArrowRight") showAt(lbIndex + 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = $("#contactForm");
  var statusEl = $("#formStatus");
  var submitBtn = $("#submitBtn");

  var emailjsReady = false;
  if (window.emailjs && CFG.EMAILJS_PUBLIC_KEY &&
      CFG.EMAILJS_PUBLIC_KEY.indexOf("YOUR_") !== 0) {
    try {
      window.emailjs.init({ publicKey: CFG.EMAILJS_PUBLIC_KEY });
      emailjsReady = true;
    } catch (e) {
      console.warn("EmailJS init failed:", e);
    }
  }

  function setError(field, msg) {
    var label = field.closest("label");
    var err = label ? label.querySelector(".err") : null;
    field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
    return !msg;
  }

  function validateField(field) {
    var v = (field.value || "").trim();
    if (field.hasAttribute("required") && !v) return setError(field, "Required");
    if (field.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      return setError(field, "Enter a valid email address");
    }
    if (field.type === "tel" && v && v.replace(/\D/g, "").length < 7) {
      return setError(field, "Enter a valid phone number");
    }
    return setError(field, "");
  }

  if (form) {
    var fields = $$("input, select, textarea", form).filter(function (f) {
      return !f.classList.contains("honeypot");
    });

    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
      f.addEventListener("input", function () {
        if (f.classList.contains("invalid")) validateField(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.className = "form-status";

      // bot check — real visitors leave this empty
      if (form.company_website.value) return;

      var firstBad = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstBad) firstBad = f;
      });
      if (firstBad) {
        firstBad.focus();
        statusEl.textContent = "Please fix the highlighted fields.";
        statusEl.className = "form-status bad";
        return;
      }

      var data = {};
      fields.forEach(function (f) { data[f.name] = (f.value || "").trim(); });

      // Aliases for EmailJS's stock template variables, so the email still reads
      // correctly even if the template wasn't fully rewritten.
      data.name = (data.first_name + " " + data.last_name).trim();
      data.title = data.project_type;
      data.time = new Date().toLocaleString();
      data.message =
        "Name: " + data.name + "\n" +
        "Email: " + data.email + "\n" +
        "Phone: " + data.phone + "\n" +
        "Project type: " + data.project_type + "\n" +
        "Location: " + [data.address, data.city, data.zip, data.country]
          .filter(Boolean).join(", ") + "\n\n" +
        "Details:\n" + (data.details || "(none provided)");

      if (!emailjsReady) {
        statusEl.innerHTML = 'Form not connected yet — please email us directly at ' +
          '<a href="mailto:' + CFG.FALLBACK_EMAIL + '">' + CFG.FALLBACK_EMAIL + '</a>.';
        statusEl.className = "form-status bad";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add("is-sending");
      $(".btn-label", submitBtn).textContent = "Sending…";

      window.emailjs
        .send(CFG.EMAILJS_SERVICE_ID, CFG.EMAILJS_TEMPLATE_ID, data)
        .then(function () {
          form.reset();
          statusEl.textContent = "Thank you — your request has been sent. We'll be in touch shortly.";
          statusEl.className = "form-status ok";
        })
        .catch(function (err) {
          console.error("EmailJS send failed:", err);
          statusEl.innerHTML = 'Something went wrong. Please email us at ' +
            '<a href="mailto:' + CFG.FALLBACK_EMAIL + '">' + CFG.FALLBACK_EMAIL + '</a>.';
          statusEl.className = "form-status bad";
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-sending");
          $(".btn-label", submitBtn).textContent = "Submit Request";
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
