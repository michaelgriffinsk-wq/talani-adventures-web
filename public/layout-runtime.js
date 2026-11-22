// Shared runtime for applying published Studio layouts, text overrides, added components & Cloudinary media
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

    // Text component
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

// Merge live Firestore destination_media/{id} Cloudinary photos onto ITINERARY_DATA
export async function hydrateDestinationMedia(itineraryArray) {
  if (!Array.isArray(itineraryArray)) return itineraryArray;
  try {
    const db = getDb();
    const snap = await getDocs(collection(db, "destination_media"));
    if (snap.empty) return itineraryArray;
    const mediaMap = new Map();
    snap.forEach((d) => {
      const data = d.data();
      if (Array.isArray(data.photos) && data.photos.length) {
        mediaMap.set(d.id, data.photos);
      }
    });
    itineraryArray.forEach((item) => {
      if (mediaMap.has(item.id)) {
        item.photos = mediaMap.get(item.id);
      }
    });
  } catch {}
  return itineraryArray;
}

export async function applyPublishedLayout(pageKey) {
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
      const widthPct = Math.min(100, Math.max(40, Number(cfg.widthPct) || 100));
      el.style.maxWidth = widthPct < 100 ? `${widthPct}%` : "";
      el.style.marginLeft = widthPct < 100 ? "auto" : "";
      el.style.marginRight = widthPct < 100 ? "auto" : "";

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
