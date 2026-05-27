/**
 * login.html — Entrar (login ou feed) | Tenho convite → convite
 */
(function initLoginPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.getElementById("welcome-actions");
    if (!footer) return;

    const [btnEntrar, btnConvite] = footer.querySelectorAll("button");
    bindLoginSheet();

    btnEntrar?.addEventListener("click", () => {
      const user = FicaBemDB.getCurrentUser();
      if (user) {
        FicaBemNav.go("feed");
        return;
      }
      openLoginSheet();
    });

    btnConvite?.addEventListener("click", () => {
      FicaBemNav.go("convite");
    });
  });

  function bindLoginSheet() {
    const form = document.getElementById("login-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      attemptLogin();
    });

    document.getElementById("login-demo-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      ensureDemoSession();
      closeLoginSheet();
      FicaBemNav.go("feed");
    });

    document.getElementById("login-sheet-cancel")?.addEventListener("click", (e) => {
      e.preventDefault();
      closeLoginSheet();
    });

    document.getElementById("login-sheet")?.addEventListener("click", (e) => {
      if (e.target.id === "login-sheet") closeLoginSheet();
    });
  }

  function openLoginSheet() {
    const sheet = document.getElementById("login-sheet");
    if (!sheet) {
      ensureDemoSession();
      FicaBemNav.go("feed");
      return;
    }
    sheet.classList.add("active");
    sheet.setAttribute("aria-hidden", "false");
  }

  function closeLoginSheet() {
    const sheet = document.getElementById("login-sheet");
    sheet?.classList.remove("active");
    sheet?.setAttribute("aria-hidden", "true");
  }

  function ensureDemoSession() {
    let user = FicaBemDB.getCurrentUser();
    if (user) return user;

    const existing = FicaBemDB.findUserByEmail("mariana@ficabem.app");
    if (existing) {
      FicaBemDB.setCurrentUser(existing.id);
      return existing;
    }

    return FicaBemDB.createUser({
      name: "Mariana",
      email: "mariana@ficabem.app",
      password: "demo123",
      username: "mariana",
    });
  }

  function attemptLogin() {
    const email = document.getElementById("login-email")?.value?.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
      FicaBemApp.showToast("Informe e-mail e senha.");
      return;
    }

    const normalizedEmail = email.includes("@") ? email : `${email.replace(/^@/, "")}@ficabem.app`;
    const result = FicaBemDB.loginWithCredentials(normalizedEmail, password);

    if (!result.ok) {
      FicaBemApp.showToast(result.error);
      return;
    }

    closeLoginSheet();
    FicaBemNav.go("feed");
  }
})();
