// Shared runtime for applying published Studio layouts & custom buttons/actions on customer pages
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const TALANI_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDhdiJxS7bI4BX0E9ObXGjMA4Y95sXZftc",
  authDomain: "talani-adventures.firebaseapp.com",
  projectId: "talani-adventures",
  storageBucket: "talani-adventures.firebasestorage.app",
  messagingSenderId: "698912000783",
  appId: "1:698912000783:web:ab04f85cb956c994558c7a",
  measurementId: "G-X2HVRDMRDM"
};

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

function renderCustomButtonsContainer(sectionEl, buttons = []) {
  const existing = sectionEl.querySelector("[data-studio-custom-buttons]");
  if (existing) existing.remove();
  if (!Array.isArray(buttons) || buttons.length === 0) return;

  const wrap = document.createElement("div");
  wrap.setAttribute("data-studio-custom-buttons", "true");
  wrap.className = "flex flex-wrap gap-3 mt-6";

  buttons.forEach((cfg) => {
    const label = String(cfg.label || "").trim();
    if (!label) return;
    const btn = document.createElement("button");
    btn.type = "button";
    const styleVariant = cfg.style || "primary";
    btn.className = styleVariant === "outline"
      ? "border border-[#304b54] text-[#304b54] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#e9eeec] cursor-pointer"
      : "bg-[#304b54] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-85 cursor-pointer";
    btn.textContent = label;
    btn.addEventListener("click", () => triggerButtonAction(cfg));
    wrap.appendChild(btn);
  });

  const targetContainer = sectionEl.querySelector(".max-w-7xl") || sectionEl;
  targetContainer.appendChild(wrap);
}

export async function applyPublishedLayout(pageKey) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(TALANI_FIREBASE_CONFIG);
    const db = getFirestore(app);
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

      const scale = Math.min(1.35, Math.max(0.75, Number(cfg.scale) || 1));
      el.style.transform = scale !== 1 ? `scale(${scale})` : "";
      el.style.transformOrigin = "top center";

      if (cfg.customTitle) {
        const heading = el.querySelector("h1, h2, h3");
        if (heading) heading.textContent = cfg.customTitle;
      }

      renderCustomButtonsContainer(el, cfg.buttons || []);
      main.appendChild(el);
    });

    return layout;
  } catch {
    return null;
  }
}
