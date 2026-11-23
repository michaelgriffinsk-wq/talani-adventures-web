// Shared Navigation, Published Layout & Destination Media/Override Runtime
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const TALANI_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDhdiJxS7bI4BX0E9ObXGjMA4Y95sXZftc",
  authDomain: "talani-adventures.firebaseapp.com",
  projectId: "talani-adventures",
  storageBucket: "talani-adventures.firebasestorage.app",
  messagingSenderId: "698912000783",
  appId: "1:698912000783:web:ab04f85cb956c994558c7a",
  measurementId: "G-X2HVRDMRDM"
};

const BG_MAP = {
  default: { bg: "#f8f7f3", fg: "#304b54" },
  white: { bg: "#ffffff", fg: "#304b54" },
  mist: { bg: "#e9eeec", fg: "#304b54" },
  ink: { bg: "#304b54", fg: "#ffffff" }
};

export function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(TALANI_FIREBASE_CONFIG);
  return getFirestore(app);
}

export function safeActionUrl(value) {
  try {
    const raw = String(value || "").trim();
    if (!raw) return null;
    if (raw.startsWith("./") || raw.startsWith("../") || raw.startsWith("#")) return raw;
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export function syncUnifiedNavigation(activePageKey = "") {
  const topActions = document.querySelector(".header-actions");
  if (topActions && !topActions.querySelector('a[href="./studio.html"]')) {
    const studioBtn = document.createElement("a");
    studioBtn.href = "./studio.html";
    studioBtn.className = "border border-[#304b54] bg-[#304b54] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90";
    studioBtn.textContent = "Studio ↗";
    topActions.appendChild(studioBtn);
  }

  const subnav = document.querySelector(".subnav-strip");
  if (!subnav) return;

  const navItems = [
    { key: "index", href: "./index.html", label: "Overview" },
    { key: "active-trip", href: "./active-trip.html", label: "Active Trips & Booking" },
    { key: "group-ya-ile-kitu", href: "./group-ya-ile-kitu.html", label: "Group ya Ile Kitu" },
    { key: "outdoor-adventures", href: "./outdoor-adventures.html", label: "Outdoor Adventures" },
    { key: "talani-adventures", href: "./talani-adventures.html", label: "Hikes & Trails" },
    { key: "memories", href: "./memories.html", label: "Past Trips & Reels" },
    { key: "adamanti", href: "./adamanti.html", label: "Adamanti (Coming Soon)" },
    { key: "talani-premium", href: "./talani-premium.html", label: "Talani Premium" }
  ];

  if (subnav.querySelector("a.subnav-link")) {
    subnav.innerHTML = navItems.map((item) => {
      const isCurrent = item.key === activePageKey || window.location.pathname.endsWith(`${item.key}.html`);
      return `<a class="subnav-link${isCurrent ? " active" : ""}" href="${item.href}">${item.label}</a>`;
    }).join("");
  }
}

export function triggerButtonAction(btnConfig = {}) {
  const actionType = btnConfig.actionType || "link";
  const target = String(btnConfig.target || "").trim();

  if (actionType === "scroll") {
    const el = target ? document.querySelector(target.startsWith("#") ? target : `#${target}`) : null;
    if (el) el.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (actionType === "select-destination") {
    const selectEl = document.getElementById("lead-dest");
    if (selectEl && target) {
      selectEl.value = target;
      const section = document.getElementById("inquiry-section") || selectEl;
      section.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const url = new URL("./group-ya-ile-kitu.html#inquiry-section", window.location.href);
    if (target) url.searchParams.set("dest", target);
    window.location.href = url.toString();
    return;
  }

  const safeHref = safeActionUrl(target);
  if (!safeHref) return;
  if (safeHref.startsWith("https://") || safeHref.startsWith("http://")) {
    window.open(safeHref, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = safeHref;
  }
}

function renderCustomComponents(sectionEl, components = [], legacyButtons = []) {
  const existing = sectionEl.querySelector("[data-studio-custom-layer]");
  if (existing) existing.remove();

  const items = Array.isArray(components) && components.length
    ? components
    : (Array.isArray(legacyButtons) ? legacyButtons.map((b) => ({ type: "button", title: b.label, content: b.target, actionType: b.actionType })) : []);

  if (!items.length) return;

  const wrap = document.createElement("div");
  wrap.setAttribute("data-studio-custom-layer", "true");
  wrap.className = "space-y-4 mt-6";

  let btnRow = null;

  items.forEach((comp) => {
    if (comp.type === "photo") {
      const src = safeActionUrl(comp.content);
      if (!src) return;
      btnRow = null;
      const img = document.createElement("img");
      img.src = src;
      img.alt = String(comp.title || "Destination photo");
      img.loading = "lazy";
      img.className = "w-full max-h-80 object-cover border border-[#dcded9]";
      wrap.appendChild(img);
      return;
    }

    if (comp.type === "button") {
      const label = String(comp.title || "").trim();
      if (!label) return;
      if (!btnRow) {
        btnRow = document.createElement("div");
        btnRow.className = "flex flex-wrap gap-3";
        wrap.appendChild(btnRow);
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bg-[#304b54] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-85 cursor-pointer";
      btn.textContent = label;
      btn.addEventListener("click", () => triggerButtonAction({
        actionType: comp.actionType || (String(comp.content || "").startsWith("#") ? "scroll" : "link"),
        target: comp.content
      }));
      btnRow.appendChild(btn);
      return;
    }

    btnRow = null;
    const textVal = String(comp.title || comp.content || "").trim();
    if (!textVal) return;
    const p = document.createElement("p");
    p.className = "text-sm leading-7";
    p.textContent = textVal;
    wrap.appendChild(p);
  });

  const targetContainer = sectionEl.querySelector(".max-w-7xl") || sectionEl;
  targetContainer.appendChild(wrap);
}

// Hydrate destination photos (up to 10) + independent destination text/size overrides from Firestore
export async function hydrateDestinationMedia(itineraryArray) {
  if (!Array.isArray(itineraryArray)) return itineraryArray;
  try {
    const db = getDb();
    const [mediaSnap, ovSnap] = await Promise.all([
      getDocs(collection(db, "destination_media")),
      getDocs(collection(db, "destination_overrides"))
    ]);

    const mediaMap = new Map();
    mediaSnap.forEach((d) => {
      const data = d.data();
      if (Array.isArray(data.photos)) {
        mediaMap.set(d.id, data.photos.slice(0, 10));
      }
    });

    const ovMap = new Map();
    ovSnap.forEach((d) => ovMap.set(d.id, d.data()));

    itineraryArray.forEach((item) => {
      if (mediaMap.has(item.id)) {
        item.photos = mediaMap.get(item.id);
      }
      if (ovMap.has(item.id)) {
        const ov = ovMap.get(item.id);
        if (ov.title !== undefined) item.title = ov.title;
        if (ov.region !== undefined) item.region = ov.region;
        if (ov.duration !== undefined) item.duration = ov.duration;
        if (ov.difficulty !== undefined) item.difficulty = ov.difficulty;
        if (ov.summary !== undefined) item.summary = ov.summary;
        if (Array.isArray(ov.activities)) item.activities = ov.activities;
        if (Number(ov.photoHeightPx) > 0) item.photoHeightPx = Number(ov.photoHeightPx);
        if (ov.hidden) item.hidden = true;
      }
    });
  } catch {}
  return itineraryArray;
}

// Shared helper to render the swipeable 10-photo carousel with lazy borders
export function renderSwipeCarousel(item, clickable = false) {
  const photos = (item.photos || []).slice(0, 10);
  if (!photos.length) return "";
  const h = Number(item.photoHeightPx) > 0 ? `${Number(item.photoHeightPx)}px` : "195px";
  const countBadge = photos.length > 1
    ? `<span class="swipe-counter" aria-hidden="true">1 / ${photos.length} · Swipe →</span>`
    : "";
  return `
    <div class="swipe-shell" style="--slide-h:${h};">
      ${countBadge}
      <div class="swipe-track" role="region" aria-label="${String(item.title || "Destination").replace(/"/g, "&quot;")} photos (${photos.length})">
        ${photos.map((p, idx) => `
          <div class="swipe-slide" style="width:${Number(p.widthPct) > 0 ? p.widthPct : 100}%;">
            <img src="${p.url}"
                 alt="${String(item.title || "").replace(/"/g, "&quot;")} — ${String(p.caption || `Photo ${idx + 1}`).replace(/"/g, "&quot;")}"
                 loading="lazy"
                 style="height:${h};"
                 ${clickable ? `data-url="${p.url}" data-cap="${String(item.title || "").replace(/"/g, "&quot;")} — ${String(p.caption || "").replace(/"/g, "&quot;")}" class="preview-img"` : ""} />
          </div>`).join("")}
      </div>
    </div>`;
}

export function bindSwipeCounters(rootEl = document) {
  rootEl.querySelectorAll(".swipe-shell").forEach((shell) => {
    const track = shell.querySelector(".swipe-track");
    const badge = shell.querySelector(".swipe-counter");
    if (!track || !badge) return;
    const total = track.querySelectorAll(".swipe-slide").length;
    track.addEventListener("scroll", () => {
      const w = track.clientWidth || 1;
      const idx = Math.min(total, Math.max(1, Math.round(track.scrollLeft / w) + 1));
      badge.textContent = idx === 1 ? `1 / ${total} · Swipe →` : `${idx} / ${total}`;
    }, { passive: true });
  });
}

export async function applyPublishedLayout(pageKey) {
  syncUnifiedNavigation(pageKey);

  try {
    const db = getDb();
    const snap = await getDoc(doc(db, "site_layouts", pageKey));
    if (!snap.exists()) return null;

    const layout = snap.data();
    const blocks = Array.isArray(layout.blocks) ? layout.blocks : [];
    const main = document.querySelector("main");
    if (!main || blocks.length === 0) return layout;

    const sectionMap = new Map();
    main.querySelectorAll("[data-block-id]").forEach((el) => {
      sectionMap.set(el.dataset.blockId, el);
    });

    const ordered = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    ordered.forEach((cfg) => {
      const el = sectionMap.get(cfg.id);
      if (!el) return;

      el.style.display = cfg.hidden ? "none" : "";

      const widthPct = Math.min(100, Math.max(50, Number(cfg.widthPct) || 100));
      const innerContainer = el.querySelector(":scope > .max-w-7xl") || el;
      if (widthPct < 100) {
        innerContainer.style.maxWidth = `${widthPct}%`;
        innerContainer.style.marginLeft = "auto";
        innerContainer.style.marginRight = "auto";
      } else {
        innerContainer.style.maxWidth = "";
      }

      if (Number(cfg.minHeightPx) > 0) {
        el.style.minHeight = `${Number(cfg.minHeightPx)}px`;
      }

      if (cfg.bgPreset && BG_MAP[cfg.bgPreset]) {
        el.style.backgroundColor = BG_MAP[cfg.bgPreset].bg;
        el.style.color = BG_MAP[cfg.bgPreset].fg;
      }

      if (cfg.imageUrl) {
        const safeImg = safeActionUrl(cfg.imageUrl);
        const imgEl = el.querySelector("img");
        if (safeImg && imgEl) imgEl.src = safeImg;
      }

      if (cfg.textOverrides && typeof cfg.textOverrides === "object") {
        Object.entries(cfg.textOverrides).forEach(([nodeKey, newVal]) => {
          const targetNode = el.querySelector(`[data-node-key="${nodeKey}"]`);
          if (targetNode) {
            targetNode.textContent = newVal;
            targetNode.style.display = newVal === "" ? "none" : "";
          }
        });
      }

      if (cfg.customTitle) {
        const heading = el.querySelector("h1, h2, h3");
        if (heading) heading.textContent = cfg.customTitle;
      }

      renderCustomComponents(el, cfg.components || [], cfg.buttons || []);
      main.appendChild(el);
    });

    return layout;
  } catch {
    return null;
  }
}
