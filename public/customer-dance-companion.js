// Reusable Customer Form Companion Widget: appears when typing in any form, dances on submit
const WIDGET_CSS = `
#talani-customer-widget{position:fixed;bottom:20px;right:20px;z-index:95;display:flex;align-items:flex-end;gap:12px;background:#ffffff;border:1px solid #dcded9;border-radius:20px;padding:10px 14px 6px 12px;box-shadow:0 16px 36px rgba(22,22,24,.22);font-family:'Plus Jakarta Sans',Raleway,-apple-system,sans-serif;transition:transform .28s cubic-bezier(.22,1,.36,1),opacity .25s ease}
#talani-customer-widget.is-hidden{opacity:0;transform:translateY(24px);pointer-events:none}
#talani-customer-widget .tcw-stage{position:relative;width:118px;height:112px;background:#f3f3f4;border-radius:14px;overflow:hidden;flex:none}
#talani-customer-widget .tcw-wrap{position:relative;width:340px;height:360px;transform:scale(.31);transform-origin:bottom left;left:4px;bottom:0}
#talani-customer-widget .character{position:absolute;bottom:0;transition:transform .3s cubic-bezier(.22,1,.36,1);transform-origin:bottom center}
#talani-customer-widget .char-purple{left:38px;width:112px;height:295px;background:#6c3ce9;border-radius:6px 6px 0 0;z-index:1}
#talani-customer-widget .char-black{left:142px;width:82px;height:215px;background:#1c1d21;border-radius:4px 4px 0 0;z-index:2}
#talani-customer-widget .char-orange{left:0;width:175px;height:125px;background:#ff7a2f;border-radius:100px 100px 0 0;z-index:4}
#talani-customer-widget .char-yellow{left:185px;width:102px;height:168px;background:#f5c931;border-radius:52px 52px 0 0;z-index:3}
#talani-customer-widget .face{position:absolute;width:100%;transition:transform .3s cubic-bezier(.22,1,.36,1)}
#talani-customer-widget .char-purple .face{top:34px}
#talani-customer-widget .char-black .face{top:28px}
#talani-customer-widget .char-orange .face{top:44px}
#talani-customer-widget .char-yellow .face{top:38px}
#talani-customer-widget .eyes-row{display:flex;justify-content:center;align-items:center;gap:14px}
#talani-customer-widget .char-black .eyes-row{gap:10px}
#talani-customer-widget .char-orange .eyes-row{gap:18px}
#talani-customer-widget .eye-white{width:15px;height:15px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
#talani-customer-widget .pupil{width:7px;height:7px;background:#111;border-radius:50%;transition:transform .12s ease-out}
#talani-customer-widget .eye-dot{width:8px;height:8px;background:#18181b;border-radius:50%;transition:transform .15s ease-out}
#talani-customer-widget .mouth{margin:10px auto 0;transition:all .28s cubic-bezier(.22,1,.36,1)}
#talani-customer-widget .char-purple .mouth{width:6px;height:11px;background:#18181b;border-radius:4px}
#talani-customer-widget .char-orange .mouth{width:24px;height:12px;background:#18181b;border-radius:0 0 20px 20px;margin-top:12px}
#talani-customer-widget .char-yellow .mouth{width:28px;height:4px;background:#18181b;border-radius:4px;margin-top:16px;transform:translateX(6px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-purple{transform:skewX(-3deg) translateX(-4px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-purple .face{transform:translateX(-24px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-purple .mouth{width:12px;height:4px;border-radius:2px}
#talani-customer-widget .tcw-stage.hiding-eyes .char-black{transform:skewX(-2deg) translateX(-3px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-black .face{transform:translateX(-18px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-orange{transform:translateX(-6px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-orange .face{transform:translateX(-32px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-orange .mouth{width:14px;height:4px;border-radius:4px}
#talani-customer-widget .tcw-stage.hiding-eyes .char-yellow{transform:skewX(-2deg) translateX(-4px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-yellow .face{transform:translateX(-24px)}
#talani-customer-widget .tcw-stage.hiding-eyes .char-yellow .mouth{transform:translateX(-4px);width:22px}
@keyframes tcwDanceLeft{0%,100%{transform:translateY(0) scaleX(1.05) scaleY(.93) rotate(-2deg)}25%{transform:translateY(-26px) scaleX(.95) scaleY(1.05) rotate(4deg)}50%{transform:translateY(0) scaleX(1.05) scaleY(.93) rotate(2deg)}75%{transform:translateY(-22px) scaleX(.95) scaleY(1.05) rotate(-4deg)}}
@keyframes tcwDanceRight{0%,100%{transform:translateY(0) scaleX(1.06) scaleY(.92) rotate(3deg)}25%{transform:translateY(-22px) scaleX(.94) scaleY(1.06) rotate(-4deg)}50%{transform:translateY(0) scaleX(1.06) scaleY(.92) rotate(-3deg)}75%{transform:translateY(-28px) scaleX(.94) scaleY(1.06) rotate(4deg)}}
@keyframes tcwFaceGroove{0%,100%{transform:translateX(-6px) translateY(2px)}50%{transform:translateX(6px) translateY(-2px)}}
#talani-customer-widget .tcw-stage.dancing .char-purple{animation:tcwDanceLeft .68s cubic-bezier(.36,0,.66,1) infinite}
#talani-customer-widget .tcw-stage.dancing .char-black{animation:tcwDanceRight .62s cubic-bezier(.36,0,.66,1) infinite;animation-delay:.12s}
#talani-customer-widget .tcw-stage.dancing .char-orange{animation:tcwDanceRight .58s cubic-bezier(.36,0,.66,1) infinite;animation-delay:.06s}
#talani-customer-widget .tcw-stage.dancing .char-yellow{animation:tcwDanceLeft .64s cubic-bezier(.36,0,.66,1) infinite;animation-delay:.18s}
#talani-customer-widget .tcw-stage.dancing .face{animation:tcwFaceGroove .64s ease-in-out infinite alternate}
#talani-customer-widget .tcw-stage.dancing .char-purple .mouth{width:18px;height:10px;border-radius:0 0 14px 14px}
#talani-customer-widget .tcw-stage.dancing .char-orange .mouth{width:28px;height:15px;border-radius:0 0 24px 24px}
#talani-customer-widget .tcw-stage.dancing .char-yellow .mouth{width:22px;height:11px;border-radius:0 0 18px 18px;transform:translateX(0)}
#talani-customer-widget .tcw-copy{max-width:170px;padding-bottom:8px}
#talani-customer-widget .tcw-title{font-size:12px;font-weight:700;color:#111113;line-height:1.3}
#talani-customer-widget .tcw-sub{font-size:11px;color:#71717a;margin-top:3px;line-height:1.35}
@media(max-width:600px){#talani-customer-widget{left:12px;right:12px;bottom:12px;justify-content:flex-start}#talani-customer-widget .tcw-copy{max-width:none}}
`;

export function mountFormDanceCompanion() {
  if (document.getElementById("talani-customer-widget")) return;

  if (!document.getElementById("talani-customer-widget-style")) {
    const st = document.createElement("style");
    st.id = "talani-customer-widget-style";
    st.textContent = WIDGET_CSS;
    document.head.appendChild(st);
  }

  const box = document.createElement("div");
  box.id = "talani-customer-widget";
  box.className = "is-hidden";
  box.setAttribute("role", "status");
  box.setAttribute("aria-live", "polite");

  box.innerHTML = `
    <div class="tcw-stage" id="tcwStage">
      <div class="tcw-wrap">
        <div class="character char-purple"><div class="face"><div class="eyes-row"><div class="eye-white"><div class="pupil"></div></div><div class="eye-white"><div class="pupil"></div></div></div><div class="mouth"></div></div></div>
        <div class="character char-black"><div class="face"><div class="eyes-row"><div class="eye-white"><div class="pupil"></div></div><div class="eye-white"><div class="pupil"></div></div></div></div></div>
        <div class="character char-yellow"><div class="face"><div class="eyes-row"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth"></div></div></div>
        <div class="character char-orange"><div class="face"><div class="eyes-row"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth"></div></div></div>
      </div>
    </div>
    <div class="tcw-copy">
      <p class="tcw-title" id="tcwTitle">We’re watching your details!</p>
      <p class="tcw-sub" id="tcwSub">Fill out the form—we’ll dance when you submit.</p>
    </div>`;

  document.body.appendChild(box);

  const stage = box.querySelector("#tcwStage");
  const titleEl = box.querySelector("#tcwTitle");
  const subEl = box.querySelector("#tcwSub");
  const pupils = box.querySelectorAll(".pupil");
  const dotEyes = box.querySelectorAll(".eye-dot");
  const characters = box.querySelectorAll(".character");

  let isDancing = false;
  let isPasswordHidden = false;
  let hideTimer = null;
  let danceTimer = null;

  function showWidget(titleText, subText) {
    clearTimeout(hideTimer);
    if (titleText) titleEl.textContent = titleText;
    if (subText) subEl.textContent = subText;
    box.classList.remove("is-hidden");
  }

  function scheduleHide(delayMs = 2600) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isDancing) box.classList.add("is-hidden");
    }, delayMs);
  }

  function applyPrivacy(field) {
    if (isDancing) return;
    const isPw = field && field.type === "password";
    isPasswordHidden = Boolean(isPw);
    if (isPasswordHidden) {
      stage.classList.add("hiding-eyes");
      pupils.forEach((p) => { p.style.transform = "translate(-4px, 0px)"; });
      dotEyes.forEach((d) => { d.style.transform = "translate(0px, 0px)"; });
      titleEl.textContent = "Eyes covered for privacy!";
      subEl.textContent = "Type your secret safely.";
    } else {
      stage.classList.remove("hiding-eyes");
    }
  }

  function trackFieldInput(field) {
    if (!field || isDancing || isPasswordHidden) return;
    const rect = field.getBoundingClientRect();
    const len = String(field.value || "").length;
    const offset = Math.min(len * 7, Math.max(20, rect.width - 20));
    const targetX = rect.left + 12 + offset;
    const targetY = rect.top + rect.height / 2;

    pupils.forEach((pupil) => {
      const r = pupil.parentElement.getBoundingClientRect();
      const angle = Math.atan2(targetY - (r.top + r.height / 2), targetX - (r.left + r.width / 2));
      pupil.style.transform = `translate(${Math.cos(angle) * 3.5}px, ${Math.sin(angle) * 3.5}px)`;
    });

    dotEyes.forEach((dot) => {
      const r = dot.getBoundingClientRect();
      const angle = Math.atan2(targetY - (r.top + r.height / 2), targetX - (r.left + r.width / 2));
      dot.style.transform = `translate(${Math.cos(angle) * 3}px, ${Math.sin(angle) * 3}px)`;
    });

    const stageRect = stage.getBoundingClientRect();
    const deltaX = Math.max(-1, Math.min(1, (targetX - (stageRect.left + stageRect.width / 2)) / 320));
    characters.forEach((char, idx) => {
      char.style.transform = `skewX(${deltaX * (idx + 1) * 0.8}deg)`;
    });
  }

  function triggerDance(durationMs = 4200) {
    isDancing = true;
    isPasswordHidden = false;
    clearTimeout(hideTimer);
    clearTimeout(danceTimer);

    stage.classList.remove("hiding-eyes");
    stage.classList.add("dancing");
    characters.forEach((char) => { char.style.transform = ""; });
    pupils.forEach((p) => { p.style.transform = "translate(0px, -1px)"; });
    dotEyes.forEach((d) => { d.style.transform = "translate(0px, -1px)"; });

    showWidget("Woohoo! Submitted!", "Let’s celebrate your adventure!");

    danceTimer = setTimeout(() => {
      isDancing = false;
      stage.classList.remove("dancing");
      scheduleHide(1800);
    }, durationMs);
  }

  const isFormField = (el) => el && el.closest("form") && el.matches("input, textarea, select");

  document.addEventListener("input", (e) => {
    if (!isFormField(e.target)) return;
    if (isDancing) return;
    showWidget("Looking good!", e.target.type === "password" ? "Eyes covered for privacy!" : "Keep going—almost there.");
    applyPrivacy(e.target);
    trackFieldInput(e.target);
    scheduleHide(3200);
  });

  document.addEventListener("focusin", (e) => {
    if (!isFormField(e.target)) return;
    if (isDancing) return;
    showWidget("We’re watching your details!", e.target.type === "password" ? "Eyes covered for privacy!" : "Fill out the form—we’ll dance when you submit.");
    applyPrivacy(e.target);
    trackFieldInput(e.target);
  });

  document.addEventListener("focusout", (e) => {
    if (!isFormField(e.target)) return;
    if (e.target.type === "password") {
      isPasswordHidden = false;
      stage.classList.remove("hiding-eyes");
    }
    scheduleHide(2200);
  });

  // Dance whenever any form is submitted or any submit button is clicked inside a form
  document.addEventListener("submit", (e) => {
    if (e.target && e.target.tagName === "FORM") {
      triggerDance(4200);
    }
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest('button[type="submit"], input[type="submit"]');
    if (!btn || !btn.closest("form")) return;
    triggerDance(4200);
  });
}
