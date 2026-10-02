"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/scripts/analytics.ts
  function clean(value, depth = 0) {
    if (depth > 3) return void 0;
    if (typeof value === "string") {
      if (EMAIL.test(value) || PHONE.test(value)) return void 0;
      return value.slice(0, 100);
    }
    if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
    if (Array.isArray(value)) return value.map((v) => clean(v, depth + 1)).filter((v) => v !== void 0).slice(0, 25);
    if (typeof value === "object" && value) return sanitize(value, depth + 1);
    return void 0;
  }
  function sanitize(params, depth = 0) {
    const out = {};
    for (const [k, v] of Object.entries(params)) {
      if (BLOCKED_KEYS.test(k)) continue;
      const c = clean(v, depth);
      if (c !== void 0) out[k] = c;
    }
    return out;
  }
  function track(event, params = {}, opts = {}) {
    const c = ctx();
    const payload = sanitize({
      language: c.language,
      locale: c.locale,
      page_type: c.pageType,
      ...params
    });
    window.dataLayer = window.dataLayer || [];
    if ("ecommerce" in payload) window.dataLayer.push({ ecommerce: null });
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      const entry = { event, ...payload };
      if (opts.waitMs) {
        entry.eventCallback = finish;
        entry.eventTimeout = opts.waitMs;
        setTimeout(finish, opts.waitMs + 50);
      } else {
        queueMicrotask(finish);
      }
      window.dataLayer.push(entry);
    });
  }
  function dataParams(el) {
    const p = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith("track") && k !== "track" && k !== "trackView" && v !== void 0) {
        const key = k.slice(5).replace(/^[A-Z]/, (m) => m.toLowerCase()).replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
        p[key] = /^\d+$/.test(v) ? Number(v) : v;
      }
    }
    return p;
  }
  function linkLocation(el) {
    const loc = el.closest("[data-track-location]");
    if (loc?.dataset.trackLocation) return loc.dataset.trackLocation;
    if (el.closest(".site-footer")) return "footer";
    if (el.closest(".site-header, .menu")) return "header";
    if (el.closest(".mobile-cta")) return "mobile_bar";
    return "content";
  }
  function initAnalytics() {
    const c = ctx();
    track("page_view", {
      page_title: document.title,
      page_path: c.path,
      country_context: c.countryContext
    });
    const pe = document.getElementById("page-events");
    if (pe?.textContent) {
      try {
        for (const e of JSON.parse(pe.textContent)) track(e.event, e.params);
      } catch {
      }
    }
    document.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!target) return;
      const tracked = target.closest("[data-track]");
      if (tracked?.dataset.track) {
        const params = dataParams(tracked);
        if (tracked.dataset.track === "select_item") {
          const { item_id, item_name, item_category, index, item_list_id, ...rest } = params;
          track("select_item", { ...rest, item_list_id, items: [{ item_id, item_name, item_category, index, item_list_id }] });
        } else {
          track(tracked.dataset.track, params);
        }
      }
      const link = target.closest("a[href]");
      if (link) {
        const href = link.getAttribute("href") || "";
        const method = href.startsWith("tel:") ? "phone" : href.startsWith("mailto:") ? "email" : /wa\.me|whatsapp/.test(href) ? "whatsapp" : "";
        if (method) track("contact_click", { contact_method: method, link_location: linkLocation(link) });
      }
    });
    const viewEls = document.querySelectorAll("[data-track-view]");
    if (viewEls.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target;
          io.unobserve(el);
          track(el.dataset.trackView, { ...dataParams(el), trigger: "scroll" });
        }
      }, { threshold: 0.5 });
      viewEls.forEach((el) => io.observe(el));
    }
  }
  var BLOCKED_KEYS, EMAIL, PHONE, ctx;
  var init_analytics = __esm({
    "src/scripts/analytics.ts"() {
      "use strict";
      BLOCKED_KEYS = /^(name|full_?name|first_?name|last_?name|email|e_?mail|phone|tel|telephone|whatsapp|message|description|enquiry|inquiry|address|street|city|postcode|postal_?code|zip|file|files|file_?name|filename|file_?names|content|comment|note|notes)$/i;
      EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
      PHONE = /\+?\d[\d\s().\/-]{7,}\d/;
      ctx = () => window.__DRVENO;
    }
  });

  // src/scripts/forms.ts
  var forms_exports = {};
  __export(forms_exports, {
    initForms: () => initForms
  });
  function initForms() {
    document.querySelectorAll("form[data-enquiry]").forEach(setup);
  }
  function setup(form) {
    const kind = form.dataset.enquiry;
    const ev = EVENTS[kind];
    const msgs = JSON.parse(form.querySelector("[data-messages]").textContent || "{}");
    const wrap = form.closest("[data-enquiry-wrap]");
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("[data-submit]");
    const submitLabel = submit.querySelector("[data-submit-label]");
    const success = wrap.querySelector("[data-form-success]");
    const errorTpl = wrap.querySelector("[data-error-template]");
    const maxFiles = Number(form.dataset.maxFiles || 5);
    const maxBytes = Number(form.dataset.maxBytes || 8 * 1024 * 1024);
    const acceptExt = (form.dataset.accept || "").split(",").map((s) => s.trim().replace(".", "").toLowerCase());
    let attempted = false;
    let started = false;
    let sending = false;
    const src = form.querySelector("[data-source-page]");
    if (src) src.value = location.pathname;
    const qs = new URLSearchParams(location.search);
    const type = qs.get("type");
    if (type) {
      const radio = form.querySelector(`input[name="project_type"][value="${CSS.escape(type)}"]`);
      if (radio) radio.checked = true;
      const sel = form.querySelector('select[name="project_type"]');
      if (sel && [...sel.options].some((o) => o.value === type)) sel.value = type;
    }
    const piece = qs.get("piece");
    const piecesEl = form.querySelector("[data-pieces]");
    if (piece && piecesEl) {
      const names = JSON.parse(piecesEl.textContent || "{}");
      if (names[piece]) {
        form.querySelector("[data-reference]").value = piece;
        const note = form.querySelector("[data-reference-note]");
        note.querySelector("[data-reference-name]").textContent = names[piece];
        note.hidden = false;
      }
    }
    const markStart = () => {
      if (started) return;
      started = true;
      track(ev.start, { form_id: kind });
    };
    form.addEventListener("focusin", markStart, { once: true });
    form.addEventListener("input", markStart, { once: true });
    const fieldError = (el) => {
      if (el instanceof HTMLFieldSetElement) {
        const checked = el.querySelector("input:checked");
        return el.dataset.required === "choice" && !checked ? msgs.requiredChoice : "";
      }
      const input = el;
      if (input instanceof HTMLInputElement && input.type === "checkbox") {
        return input.dataset.required === "consent" && !input.checked ? msgs.consent : "";
      }
      if (input instanceof HTMLInputElement && input.type === "file") return filesError(input);
      const value = input.value.trim();
      if (!value) {
        if (!input.dataset.required) return "";
        return input instanceof HTMLSelectElement ? msgs.requiredSelect : msgs.required;
      }
      if (input.dataset.type === "email" && !EMAIL_RE.test(value)) return msgs.email;
      if (input.dataset.type === "phone" && (!PHONE_RE.test(value) || value.replace(/\D/g, "").length < 6)) return msgs.phone;
      const min = Number(input.dataset.minlength || 0);
      if (min && value.length < min) return msgs.tooShort.replace("{min}", String(min));
      const max = input.maxLength;
      if (max > 0 && value.length > max) return msgs.tooLong.replace("{max}", String(max));
      return "";
    };
    const filesError = (input) => {
      const files = [...input.files ?? []];
      if (files.length > maxFiles) return msgs.fileCount;
      if (files.reduce((s, f) => s + f.size, 0) > maxBytes) return msgs.fileSize;
      if (files.some((f) => !acceptExt.includes(f.name.split(".").pop()?.toLowerCase() ?? ""))) return msgs.fileType;
      return "";
    };
    const errorEl = (el) => {
      const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/);
      const id = ids.find((i) => i.endsWith("-error"));
      return id ? document.getElementById(id) : null;
    };
    const show = (el, message) => {
      const err = errorEl(el);
      if (message) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
      if (err) {
        err.textContent = message;
        err.hidden = !message;
      }
    };
    const validatable = () => [...form.querySelectorAll('[data-required], [data-type], input[type="file"]')].filter(
      (el) => !(el instanceof HTMLFieldSetElement) || el.dataset.required
    );
    const nameOf = (el) => el instanceof HTMLFieldSetElement ? el.dataset.group : el.name;
    const validateAll = () => {
      const invalid = [];
      for (const el of validatable()) {
        const m = fieldError(el);
        show(el, m);
        if (m) invalid.push({ el, type: Object.keys(msgs).find((k) => msgs[k] === m) ?? "invalid" });
      }
      return invalid;
    };
    form.addEventListener("focusout", (e) => {
      const el = e.target.closest("[data-required], [data-type]");
      if (!el || el instanceof HTMLFieldSetElement) return;
      if (attempted || el.value?.trim()) show(el, fieldError(el));
    });
    form.addEventListener("change", (e) => {
      const target = e.target;
      const group = target.closest("fieldset[data-required]");
      if (group && attempted) show(group, fieldError(group));
      if (target instanceof HTMLInputElement && target.type === "checkbox" && target.dataset.required && attempted) show(target, fieldError(target));
      if (target instanceof HTMLSelectElement && target.dataset.required && attempted) show(target, fieldError(target));
    });
    form.addEventListener("input", (e) => {
      const el = e.target;
      if (el.getAttribute("aria-invalid") === "true" && !(el instanceof HTMLFieldSetElement)) show(el, fieldError(el));
    });
    const fileInput = form.querySelector("[data-files]");
    if (fileInput) {
      const statusEl = form.querySelector("[data-files-status]");
      const list = form.querySelector("[data-files-list]");
      fileInput.addEventListener("change", () => {
        const files = [...fileInput.files ?? []];
        statusEl.textContent = files.length ? msgs.filesSelected.replace("{count}", String(files.length)) : msgs.filesNone;
        list.replaceChildren(...files.map((f) => Object.assign(document.createElement("li"), { textContent: f.name })));
        show(fileInput, filesError(fileInput));
        if (files.length) {
          track("project_file_added", {
            form_id: kind,
            file_count: files.length,
            file_types: [...new Set(files.map(fileKind))],
            total_size: sizeBucket(files.reduce((s, f) => s + f.size, 0))
          });
        }
      });
    }
    const setSending = (on) => {
      sending = on;
      submit.disabled = on;
      submit.setAttribute("aria-busy", String(on));
      submitLabel.textContent = on ? msgs.sending : submitLabel.dataset.label || submitLabel.textContent || "";
    };
    submitLabel.dataset.label = submitLabel.textContent || "";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;
      attempted = true;
      status.hidden = true;
      const invalid = validateAll();
      if (invalid.length) {
        status.textContent = invalid.length === 1 ? msgs.summaryOne : msgs.summaryMany.replace("{count}", String(invalid.length));
        status.hidden = false;
        const first = invalid[0].el;
        const focusTarget = first instanceof HTMLFieldSetElement ? first.querySelector("input") : first;
        focusTarget?.focus();
        track(ev.error, {
          form_id: kind,
          error_count: invalid.length,
          error_fields: invalid.map((i) => nameOf(i.el)),
          error_types: [...new Set(invalid.map((i) => i.type))]
        });
        return;
      }
      setSending(true);
      const data = new FormData(form);
      const endpoint = form.dataset.endpoint || "/";
      try {
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        const files = fileInput?.files ? [...fileInput.files] : [];
        track(ev.submit, {
          form_id: kind,
          project_type: String(data.get("project_type") || "") || void 0,
          consultation_type: String(data.get("consultation_type") || "") || void 0,
          timeline: String(data.get("timeline") || "") || void 0,
          wood_preference: String(data.get("wood") || "") || void 0,
          project_country: String(data.get("country") || "") || void 0,
          reference_piece: String(data.get("reference") || "") || void 0,
          has_files: files.length > 0,
          file_count: files.length
        });
        form.hidden = true;
        success.hidden = false;
        success.focus();
        success.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      } catch {
        status.replaceChildren(errorTpl.content.cloneNode(true));
        status.hidden = false;
        status.focus();
        track(ev.error, { form_id: kind, error_count: 1, error_fields: ["submit"], error_types: ["network"] });
      } finally {
        setSending(false);
      }
    });
  }
  var EVENTS, EMAIL_RE, PHONE_RE, fileKind, sizeBucket;
  var init_forms = __esm({
    "src/scripts/forms.ts"() {
      "use strict";
      init_analytics();
      EVENTS = {
        quote: { start: "quote_form_start", submit: "quote_form_submit", error: "quote_form_error" },
        consultation: { start: "consultation_start", submit: "consultation_submit", error: "consultation_error" },
        contact: { start: "contact_form_start", submit: "contact_form_submit", error: "contact_form_error" }
      };
      EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      PHONE_RE = /^\+?[\d\s().\/-]{6,24}$/;
      fileKind = (f) => {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        if (["jpg", "jpeg", "png", "heic", "heif", "webp"].includes(ext)) return "image";
        if (ext === "pdf") return "pdf";
        if (["dwg", "dxf"].includes(ext)) return "cad";
        return "other";
      };
      sizeBucket = (bytes) => bytes < 1e6 ? "<1MB" : bytes < 3e6 ? "1-3MB" : bytes < 8e6 ? "3-8MB" : ">8MB";
    }
  });

  // src/scripts/gallery.ts
  var gallery_exports = {};
  __export(gallery_exports, {
    initGalleries: () => initGalleries
  });
  function initGalleries() {
    document.querySelectorAll("[data-gallery]").forEach((root) => {
      const track_ = root.querySelector("[data-gallery-track]");
      const slides = [...track_.children];
      const prev = root.querySelector("[data-gallery-prev]");
      const next = root.querySelector("[data-gallery-next]");
      const pos = root.querySelector("[data-gallery-pos]");
      const template = pos?.dataset.template || "{current} / {total}";
      const id = root.dataset.gallery || "gallery";
      let index = 0;
      let lastReported = -1;
      const go = (i) => {
        index = Math.max(0, Math.min(slides.length - 1, i));
        track_.scrollTo({ left: slides[index].offsetLeft - track_.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      };
      const update = () => {
        const left = track_.scrollLeft;
        let best = 0;
        slides.forEach((s, i) => {
          if (Math.abs(s.offsetLeft - track_.offsetLeft - left) < Math.abs(slides[best].offsetLeft - track_.offsetLeft - left)) best = i;
        });
        index = best;
        if (pos) pos.textContent = template.replace("{current}", String(index + 1)).replace("{total}", String(slides.length));
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index >= slides.length - 1;
      };
      const report = (action) => {
        if (index === lastReported && action === "swipe") return;
        lastReported = index;
        track("gallery_interaction", { gallery_id: id, action, image_index: index + 1, image_count: slides.length });
      };
      prev?.addEventListener("click", () => {
        go(index - 1);
        report("previous");
      });
      next?.addEventListener("click", () => {
        go(index + 1);
        report("next");
      });
      let timer = 0;
      track_.addEventListener("scroll", () => {
        cancelAnimationFrame(timer);
        timer = requestAnimationFrame(update);
      }, { passive: true });
      let touched = false;
      track_.addEventListener("pointerdown", () => {
        touched = true;
      }, { passive: true });
      track_.addEventListener("scrollend", () => {
        if (touched) {
          touched = false;
          report("swipe");
        }
      });
      track_.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
          report("keyboard");
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
          report("keyboard");
        }
      });
      update();
    });
  }
  var init_gallery = __esm({
    "src/scripts/gallery.ts"() {
      "use strict";
      init_analytics();
    }
  });

  // src/scripts/before-after.ts
  var before_after_exports = {};
  __export(before_after_exports, {
    initBeforeAfter: () => initBeforeAfter
  });
  function initBeforeAfter() {
    document.querySelectorAll("[data-before-after]").forEach((root) => {
      const range = root.querySelector('input[type="range"]');
      const id = root.dataset.beforeAfter || "before_after";
      let reported = false;
      let timer = 0;
      const set = () => root.style.setProperty("--pos", `${range.value}%`);
      range.addEventListener("input", () => {
        set();
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          const v = Number(range.value);
          track("before_after_interaction", {
            comparison_id: id,
            position: v < 34 ? "after" : v > 66 ? "before" : "middle",
            first_interaction: !reported
          });
          reported = true;
        }, 400);
      });
      set();
    });
  }
  var init_before_after = __esm({
    "src/scripts/before-after.ts"() {
      "use strict";
      init_analytics();
    }
  });

  // src/scripts/filters.ts
  var filters_exports = {};
  __export(filters_exports, {
    initFilters: () => initFilters
  });
  function initFilters() {
    const root = document.querySelector("[data-filters]");
    const buttons = [...root.querySelectorAll("button[data-filter]")];
    const items = [...document.querySelectorAll("[data-filter-tags]")];
    const count = document.querySelector("[data-filter-count]");
    const empty = document.querySelector("[data-filter-empty]");
    root.hidden = false;
    const apply2 = (filter, user) => {
      let visible = 0;
      for (const item of items) {
        const show = filter === "all" || item.dataset.filterTags.split(" ").includes(filter);
        item.hidden = !show;
        if (show) visible++;
      }
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
      if (count) count.textContent = visible === 1 ? count.dataset.one : count.dataset.many.replace("{count}", String(visible));
      if (empty) empty.hidden = visible > 0;
      if (user) {
        history.replaceState(null, "", filter === "all" ? location.pathname : `#${filter}`);
        track("portfolio_filter", { filter_value: filter, results_count: visible });
      }
    };
    buttons.forEach((b) => b.addEventListener("click", () => apply2(b.dataset.filter, true)));
    const initial = location.hash.slice(1);
    apply2(buttons.some((b) => b.dataset.filter === initial) ? initial : "all", false);
  }
  var init_filters = __esm({
    "src/scripts/filters.ts"() {
      "use strict";
      init_analytics();
    }
  });

  // src/scripts/main.ts
  init_analytics();

  // src/scripts/consent.ts
  init_analytics();
  var KEY = "drveno_consent";
  function apply(choice) {
    const v = window.__DRVENO.consentVersion;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...choice, v, ts: Date.now() }));
    } catch {
    }
    const m = choice.marketing ? "granted" : "denied";
    window.gtag?.("consent", "update", {
      analytics_storage: choice.analytics ? "granted" : "denied",
      ad_storage: m,
      ad_user_data: m,
      ad_personalization: m
    });
    document.documentElement.setAttribute("data-consent", "set");
    track("consent_update", { analytics_consent: choice.analytics, marketing_consent: choice.marketing });
    if (choice.analytics || choice.marketing) window.__loadGtm?.();
  }
  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && s.v === window.__DRVENO.consentVersion) return { analytics: !!s.analytics, marketing: !!s.marketing };
    } catch {
    }
    return null;
  }
  function initConsent() {
    const dialog = document.querySelector("[data-consent-dialog]");
    const form = document.querySelector("[data-consent-form]");
    const status = document.querySelector("[data-consent-status]");
    if (!dialog || !form) return;
    const open = () => {
      const current = read();
      form.elements.namedItem("analytics").checked = current?.analytics ?? false;
      form.elements.namedItem("marketing").checked = current?.marketing ?? false;
      dialog.showModal();
    };
    const close = () => dialog.close();
    const confirm = (choice) => {
      apply(choice);
      if (status) status.textContent = status.dataset.savedText || "";
      if (dialog.open) close();
    };
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-consent-open], [data-consent-close], [data-consent-action]");
      if (!el) return;
      if (el.hasAttribute("data-consent-open")) {
        e.preventDefault();
        open();
        return;
      }
      if (el.hasAttribute("data-consent-close")) {
        close();
        return;
      }
      const action = el.dataset.consentAction;
      if (action === "accept") confirm({ analytics: true, marketing: true });
      else if (action === "reject") confirm({ analytics: false, marketing: false });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      confirm({
        analytics: form.elements.namedItem("analytics").checked,
        marketing: form.elements.namedItem("marketing").checked
      });
    });
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });
  }

  // src/scripts/lang.ts
  init_analytics();

  // src/i18n/config.ts
  var locales = ["en", "de", "sr"];

  // src/scripts/local-links.ts
  var isLocal = location.protocol === "file:";
  function localHref(href) {
    if (!isLocal || /^(?:[a-z]+:|#|\/\/)/i.test(href)) return href;
    const m = href.match(/^([^?#]*)([?#].*)?$/);
    const path = m[1];
    if (path === "" || !path.endsWith("/")) return href;
    return `${path}index.html${m[2] ?? ""}`;
  }
  function fixLocalLinks(root = document) {
    if (!isLocal) return;
    root.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      const fixed = localHref(h);
      if (fixed !== h) a.setAttribute("href", fixed);
    });
  }

  // src/scripts/lang.ts
  var PREF_KEY = "drveno_lang";
  var DISMISS_KEY = "drveno_lang_suggest";
  function storeLanguage(lang) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ lang, manual: true, ts: Date.now() }));
    } catch {
    }
    document.cookie = `${PREF_KEY}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }
  function storedLanguage() {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || "null")?.lang ?? null;
    } catch {
      return null;
    }
  }
  function browserLocale() {
    for (const raw of navigator.languages ?? [navigator.language]) {
      const l = raw.toLowerCase();
      if (l.startsWith("de") || l.startsWith("gsw")) return "de";
      if (l.startsWith("sr") || l.startsWith("hr") || l.startsWith("bs") || l.startsWith("sh") || l.startsWith("cnr")) return "sr";
      if (l.startsWith("en")) return "en";
    }
    return null;
  }
  function initLang() {
    const c = ctx();
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-lang-switch]");
      if (!a) return;
      const selected = a.dataset.langSwitch;
      if (!locales.includes(selected)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        storeLanguage(selected);
        return;
      }
      storeLanguage(selected);
      if (selected === c.language) return;
      e.preventDefault();
      const href = a.href;
      track("language_change", {
        previous_language: c.language,
        selected_language: selected,
        page_type: c.pageType,
        page_path: c.path
      }, { waitMs: 250 }).then(() => {
        location.href = href;
      });
    });
    const box = document.querySelector("[data-lang-suggest]");
    if (!box) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
    }
    if (storedLanguage() || dismissed) return;
    const preferred = browserLocale();
    if (!preferred || preferred === c.language) return;
    const options = JSON.parse(box.querySelector("script").textContent || "[]");
    const o = options.find((x) => x.lang === preferred);
    if (!o) return;
    box.lang = o.htmlLang;
    box.querySelector("[data-text]").textContent = o.text;
    const go = box.querySelector("[data-go]");
    go.textContent = o.action;
    go.setAttribute("href", localHref(o.href));
    go.dataset.langSwitch = o.lang;
    const dismiss = box.querySelector("[data-dismiss]");
    dismiss.textContent = o.dismiss;
    dismiss.addEventListener("click", () => {
      box.hidden = true;
      try {
        sessionStorage.setItem(DISMISS_KEY, "1");
      } catch {
      }
      storeLanguage(c.language);
    });
    setTimeout(() => {
      box.hidden = false;
    }, 1200);
  }

  // src/scripts/ui.ts
  function initUi() {
    const menu = document.getElementById("site-menu");
    const opener = document.querySelector("[data-menu-open]");
    if (menu && opener) {
      opener.addEventListener("click", () => {
        menu.showModal();
        opener.setAttribute("aria-expanded", "true");
        document.documentElement.style.overflow = "hidden";
      });
      menu.querySelector("[data-menu-close]")?.addEventListener("click", () => menu.close());
      menu.addEventListener("close", () => {
        opener.setAttribute("aria-expanded", "false");
        document.documentElement.style.overflow = "";
        opener.focus();
      });
      menu.addEventListener("click", (e) => {
        if (e.target.closest("a[href]")) menu.close();
      });
      matchMedia("(min-width: 1180px)").addEventListener("change", (m) => {
        if (m.matches && menu.open) menu.close();
      });
    }
    const header = document.querySelector("[data-header]");
    const bar = document.querySelector("[data-mobile-cta]");
    const footer = document.querySelector(".site-footer");
    let footerVisible = false;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header?.classList.toggle("is-scrolled", y > 24);
      if (bar) {
        const show = y > window.innerHeight * 0.6 && !footerVisible;
        if (show !== bar.classList.contains("is-visible")) {
          bar.classList.toggle("is-visible", show);
          bar.setAttribute("aria-hidden", String(!show));
          bar.querySelectorAll("a").forEach((a) => show ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1"));
        }
      }
    };
    addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    if (footer && bar && "IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        footerVisible = e.isIntersecting;
        update();
      }).observe(footer);
    }
    update();
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  }

  // src/scripts/main.ts
  fixLocalLinks();
  initAnalytics();
  initUi();
  initLang();
  initConsent();
  if (document.querySelector("form[data-enquiry]")) Promise.resolve().then(() => (init_forms(), forms_exports)).then((m) => m.initForms());
  if (document.querySelector("[data-gallery]")) Promise.resolve().then(() => (init_gallery(), gallery_exports)).then((m) => m.initGalleries());
  if (document.querySelector("[data-before-after]")) Promise.resolve().then(() => (init_before_after(), before_after_exports)).then((m) => m.initBeforeAfter());
  if (document.querySelector("[data-filters]")) Promise.resolve().then(() => (init_filters(), filters_exports)).then((m) => m.initFilters());
})();
