// Reusable Animated Character Login Modal + Firebase Auth Gate for Talani Adventures Studio
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { TALANI_FIREBASE_CONFIG } from "./layout-runtime.js";

function getFirebaseAuth() {
  const app = getApps().length ? getApps()[0] : initializeApp(TALANI_FIREBASE_CONFIG);
  return getAuth(app);
}

const MODAL_CSS = `
#talani-auth-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(22,22,24,.88);backdrop-filter:blur(8px);padding:20px;font-family:'Plus Jakarta Sans',Raleway,-apple-system,sans-serif}
#talani-auth-overlay *{box-sizing:border-box;margin:0;padding:0}
#talani-auth-overlay .login-card{display:flex;width:100%;max-width:900px;min-height:540px;background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.45)}
#talani-auth-overlay .stage-panel{flex:1.05;background:#f3f3f4;position:relative;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;padding-top:40px}
#talani-auth-overlay .characters-wrapper{position:relative;width:340px;height:360px}
#talani-auth-overlay .character{position:absolute;bottom:0;transition:transform .35s cubic-bezier(.22,1,.36,1);transform-origin:bottom center}
#talani-auth-overlay .char-purple{left:38px;width:112px;height:295px;background:#6c3ce9;border-radius:6px 6px 0 0;z-index:1}
#talani-auth-overlay .char-black{left:142px;width:82px;height:215px;background:#1c1d21;border-radius:4px 4px 0 0;z-index:2}
#talani-auth-overlay .char-orange{left:0;width:175px;height:125px;background:#ff7a2f;border-radius:100px 100px 0 0;z-index:4}
#talani-auth-overlay .char-yellow{left:185px;width:102px;height:168px;background:#f5c931;border-radius:52px 52px 0 0;z-index:3}
#talani-auth-overlay .face{position:absolute;width:100%;transition:transform .35s cubic-bezier(.22,1,.36,1)}
#talani-auth-overlay .char-purple .face{top:34px}
#talani-auth-overlay .char-black .face{top:28px}
#talani-auth-overlay .char-orange .face{top:44px}
#talani-auth-overlay .char-yellow .face{top:38px}
#talani-auth-overlay .eyes-row{display:flex;justify-content:center;align-items:center;gap:14px}
#talani-auth-overlay .char-black .eyes-row{gap:10px}
#talani-auth-overlay .char-orange .eyes-row{gap:18px}
#talani-auth-overlay .eye-white{width:15px;height:15px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
#talani-auth-overlay .pupil{width:7px;height:7px;background:#111;border-radius:50%;transition:transform .12s ease-out}
#talani-auth-overlay .eye-dot{width:8px;height:8px;background:#18181b;border-radius:50%;transition:transform .15s ease-out}
#talani-auth-overlay .mouth{margin:10px auto 0;transition:all .3s cubic-bezier(.22,1,.36,1)}
#talani-auth-overlay .char-purple .mouth{width:6px;height:11px;background:#18181b;border-radius:4px}
#talani-auth-overlay .char-orange .mouth{width:24px;height:12px;background:#18181b;border-radius:0 0 20px 20px;margin-top:12px}
#talani-auth-overlay .char-yellow .mouth{width:28px;height:4px;background:#18181b;border-radius:4px;margin-top:16px;transform:translateX(6px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-purple{transform:skewX(-3deg) translateX(-4px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-purple .face{transform:translateX(-24px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-purple .mouth{width:12px;height:4px;border-radius:2px}
#talani-auth-overlay .stage-panel.hiding-eyes .char-black{transform:skewX(-2deg) translateX(-3px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-black .face{transform:translateX(-18px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-orange{transform:translateX(-6px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-orange .face{transform:translateX(-32px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-orange .mouth{width:14px;height:4px;border-radius:4px}
#talani-auth-overlay .stage-panel.hiding-eyes .char-yellow{transform:skewX(-2deg) translateX(-4px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-yellow .face{transform:translateX(-24px)}
#talani-auth-overlay .stage-panel.hiding-eyes .char-yellow .mouth{transform:translateX(-4px);width:22px}
#talani-auth-overlay .form-panel{flex:1;padding:42px 48px;display:flex;flex-direction:column;justify-content:center;background:#fff}
#talani-auth-overlay .brand-mark{width:32px;height:32px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center}
#talani-auth-overlay h2{font-size:26px;font-weight:700;color:#111113;text-align:center;letter-spacing:-.02em}
#talani-auth-overlay .subtitle{font-size:13px;color:#71717a;text-align:center;margin-top:6px;margin-bottom:24px}
#talani-auth-overlay .input-group{margin-bottom:18px;position:relative}
#talani-auth-overlay label{display:block;font-size:12px;font-weight:600;color:#27272a;margin-bottom:6px}
#talani-auth-overlay .input-wrapper{position:relative;display:flex;align-items:center}
#talani-auth-overlay input[type="email"],#talani-auth-overlay input[type="password"],#talani-auth-overlay input[type="text"]{width:100%;padding:10px 36px 10px 4px;font-size:14px;color:#18181b;border:none;border-bottom:1.5px solid #e4e4e7;outline:none;background:transparent}
#talani-auth-overlay input:focus{border-bottom-color:#304b54}
#talani-auth-overlay .toggle-password{position:absolute;right:4px;background:none;border:none;cursor:pointer;color:#52525b;padding:4px}
#talani-auth-overlay .form-options{display:flex;align-items:center;justify-content:space-between;margin:8px 0 22px;font-size:12px}
#talani-auth-overlay .remember-me{display:flex;align-items:center;gap:8px;color:#52525b;cursor:pointer}
#talani-auth-overlay .forgot-link{color:#304b54;text-decoration:none;font-weight:600;cursor:pointer;background:none;border:none;font-size:12px}
#talani-auth-overlay .btn-primary{width:100%;padding:13px;background:#304b54;color:#fff;border:none;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer}
#talani-auth-overlay .btn-primary:hover{opacity:.9}
#talani-auth-overlay .btn-google{width:100%;padding:12px;margin-top:10px;background:#f4f4f5;color:#18181b;border:none;border-radius:999px;font-size:13.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
#talani-auth-overlay .btn-google:hover{background:#e4e4e7}
#talani-auth-overlay .auth-err{margin-top:12px;font-size:12px;font-weight:600;color:#991b1b;text-align:center;min-height:18px}
@media(max-width:768px){#talani-auth-overlay .login-card{flex-direction:column;max-width:440px}#talani-auth-overlay .stage-panel{min-height:220px;padding-top:16px}#talani-auth-overlay .characters-wrapper{transform:scale(.7);transform-origin:bottom center}#talani-auth-overlay .form-panel{padding:28px 24px}}
`;

function injectStyles() {
  if (document.getElementById("talani-auth-style")) return;
  const style = document.createElement("style");
  style.id = "talani-auth-style";
  style.textContent = MODAL_CSS;
  document.head.appendChild(style);
}

export function openAuthModal() {
  injectStyles();
  const existing = document.getElementById("talani-auth-overlay");
  if (existing) existing.remove();

  const auth = getFirebaseAuth();

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "talani-auth-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Talani Studio Admin Login");

    overlay.innerHTML = `
      <div class="login-card">
        <div class="stage-panel" id="taStagePanel">
          <div class="characters-wrapper">
            <div class="character char-purple"><div class="face"><div class="eyes-row"><div class="eye-white"><div class="pupil"></div></div><div class="eye-white"><div class="pupil"></div></div></div><div class="mouth"></div></div></div>
            <div class="character char-black"><div class="face"><div class="eyes-row"><div class="eye-white"><div class="pupil"></div></div><div class="eye-white"><div class="pupil"></div></div></div></div></div>
            <div class="character char-yellow"><div class="face"><div class="eyes-row"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth"></div></div></div>
            <div class="character char-orange"><div class="face"><div class="eyes-row"><div class="eye-dot"></div><div class="eye-dot"></div></div><div class="mouth"></div></div></div>
          </div>
        </div>
        <div class="form-panel">
          <div class="brand-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2C14 9.5 18.5 14 26 14C18.5 14 14 18.5 14 26C14 18.5 9.5 14 2 14C9.5 14 14 9.5 14 2Z" fill="#304b54"/></svg>
          </div>
          <h2>Talani Studio</h2>
          <p class="subtitle">Sign in to publish changes &amp; manage operations</p>
          <form id="taLoginForm">
            <div class="input-group">
              <label for="taEmail">Admin Email</label>
              <div class="input-wrapper"><input type="email" id="taEmail" placeholder="team@talani-adventures.com" autocomplete="email" required /></div>
            </div>
            <div class="input-group">
              <label for="taPassword">Password</label>
              <div class="input-wrapper">
                <input type="password" id="taPassword" placeholder="••••••••" autocomplete="current-password" required />
                <button type="button" class="toggle-password" id="taTogglePw" aria-label="Toggle password visibility">
                  <svg id="taEyeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <div class="form-options">
              <label class="remember-me"><input type="checkbox" id="taRemember" checked /><span>Remember for 30 days</span></label>
              <button type="button" class="forgot-link" id="taForgotBtn">Forgot password?</button>
            </div>
            <button type="submit" class="btn-primary" id="taSubmitBtn">Log in to Studio</button>
            <button type="button" class="btn-google" id="taGoogleBtn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/><path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/></svg>
              <span>Log in with Google</span>
            </button>
            <p class="auth-err" id="taAuthErr"></p>
          </form>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const stagePanel = overlay.querySelector("#taStagePanel");
    const emailInput = overlay.querySelector("#taEmail");
    const passwordInput = overlay.querySelector("#taPassword");
    const toggleBtn = overlay.querySelector("#taTogglePw");
    const eyeIcon = overlay.querySelector("#taEyeIcon");
    const errEl = overlay.querySelector("#taAuthErr");
    const pupils = overlay.querySelectorAll(".pupil");
    const dotEyes = overlay.querySelectorAll(".eye-dot");
    const characters = overlay.querySelectorAll(".character");

    let isPasswordFocused = false;
    let isPasswordVisible = false;

    function updatePrivacyState() {
      const shouldHide = isPasswordFocused && !isPasswordVisible;
      if (shouldHide) {
        stagePanel.classList.add("hiding-eyes");
        pupils.forEach((p) => { p.style.transform = "translate(-4px, 0px)"; });
        dotEyes.forEach((d) => { d.style.transform = "translate(0px, 0px)"; });
      } else {
        stagePanel.classList.remove("hiding-eyes");
      }
    }

    function lookAtTarget(targetX, targetY) {
      if (stagePanel.classList.contains("hiding-eyes")) return;
      pupils.forEach((pupil) => {
        const rect = pupil.parentElement.getBoundingClientRect();
        const angle = Math.atan2(targetY - (rect.top + rect.height / 2), targetX - (rect.left + rect.width / 2));
        pupil.style.transform = `translate(${Math.cos(angle) * 3.5}px, ${Math.sin(angle) * 3.5}px)`;
      });
      dotEyes.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const angle = Math.atan2(targetY - (rect.top + rect.height / 2), targetX - (rect.left + rect.width / 2));
        dot.style.transform = `translate(${Math.cos(angle) * 3}px, ${Math.sin(angle) * 3}px)`;
      });
      const stageRect = stagePanel.getBoundingClientRect();
      const deltaX = Math.max(-1, Math.min(1, (targetX - (stageRect.left + stageRect.width / 2)) / 350));
      characters.forEach((char, idx) => {
        char.style.transform = `skewX(${deltaX * (idx + 1) * 0.8}deg)`;
      });
    }

    const onMouseMove = (e) => {
      if (!document.body.contains(overlay)) {
        document.removeEventListener("mousemove", onMouseMove);
        return;
      }
      if (document.activeElement === emailInput) return;
      lookAtTarget(e.clientX, e.clientY);
    };
    document.addEventListener("mousemove", onMouseMove);

    const trackEmail = () => {
      const rect = emailInput.getBoundingClientRect();
      const offset = Math.min(emailInput.value.length * 7.5, rect.width - 20);
      lookAtTarget(rect.left + 15 + offset, rect.top + rect.height / 2);
    };
    emailInput.addEventListener("focus", trackEmail);
    emailInput.addEventListener("input", trackEmail);

    passwordInput.addEventListener("focus", () => {
      isPasswordFocused = true;
      updatePrivacyState();
      if (isPasswordVisible) {
        const rect = passwordInput.getBoundingClientRect();
        lookAtTarget(rect.left + 40, rect.top + rect.height / 2);
      }
    });
    passwordInput.addEventListener("blur", () => {
      isPasswordFocused = false;
      updatePrivacyState();
    });

    toggleBtn.addEventListener("click", () => {
      isPasswordVisible = !isPasswordVisible;
      passwordInput.type = isPasswordVisible ? "text" : "password";
      eyeIcon.innerHTML = isPasswordVisible
        ? `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>`
        : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
      updatePrivacyState();
    });

    function finishLogin(user) {
      document.removeEventListener("mousemove", onMouseMove);
      overlay.remove();
      resolve(user);
    }

    overlay.querySelector("#taLoginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.textContent = "";
      const submitBtn = overlay.querySelector("#taSubmitBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in...";
      try {
        const persist = overlay.querySelector("#taRemember").checked ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persist);
        const cred = await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        finishLogin(cred.user);
      } catch (err) {
        errEl.textContent = err.message.replace("Firebase:", "").trim();
        submitBtn.disabled = false;
        submitBtn.textContent = "Log in to Studio";
      }
    });

    overlay.querySelector("#taGoogleBtn").addEventListener("click", async () => {
      errEl.textContent = "";
      try {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        finishLogin(cred.user);
      } catch (err) {
        errEl.textContent = err.message.replace("Firebase:", "").trim();
      }
    });

    overlay.querySelector("#taForgotBtn").addEventListener("click", async () => {
      const email = emailInput.value.trim();
      if (!email) { errEl.textContent = "Enter your email above first to reset password."; return; }
      try {
        await sendPasswordResetEmail(auth, email);
        errEl.style.color = "#166534";
        errEl.textContent = "✓ Password reset email sent!";
      } catch (err) {
        errEl.style.color = "#991b1b";
        errEl.textContent = err.message.replace("Firebase:", "").trim();
      }
    });
  });
}

export function requireStudioAuth(onReady) {
  const auth = getFirebaseAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const existing = document.getElementById("talani-auth-overlay");
      if (existing) existing.remove();
      if (typeof onReady === "function") onReady(user);
    } else {
      const signedInUser = await openAuthModal();
      if (typeof onReady === "function") onReady(signedInUser);
    }
  });
}

export async function logoutStudio() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}
