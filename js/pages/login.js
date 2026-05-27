/**
 * login.html — Login (localStorage)
 */
(function initLoginPage() {
  document.addEventListener("DOMContentLoaded", () => {
    try {
      FicaBemDB.seedDemoUser();
    } catch (err) {
      console.error("[login]", err);
    }

    FicaBemApp.bindPasswordToggles();
    bindLoginForm();
  });

  function bindLoginForm() {
    const form = document.getElementById("form-login");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const identifier = document.getElementById("login-identifier")?.value?.trim();
      const password = document.getElementById("login-password")?.value;

      if (!identifier || !password) {
        showError("Preencha e-mail/usuário e senha.");
        return;
      }

      const result = FicaBemDB.loginWithCredentials(identifier, password);
      if (!result.ok) {
        showError(result.error);
        return;
      }

      if (typeof FicaBemApp !== "undefined") {
        FicaBemApp.showToast(`Bem-vinda, ${result.user.name.split(" ")[0]}!`);
      }
      if (typeof FicaBemNav !== "undefined") {
        FicaBemNav.go("feed");
      } else {
        window.location.href = "feed.html";
      }
    });
  }

  function showError(message) {
    const el = document.getElementById("login-error");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function clearErrors() {
    document.getElementById("login-error")?.classList.add("hidden");
  }
})();
