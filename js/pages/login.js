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

    bindPasswordToggles();
    bindLoginForm();
  });

  function bindPasswordToggles() {
    document.querySelectorAll(".password-field__toggle, .auth-toggle-password").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.innerHTML = show
          ? '<i class="fa-regular fa-eye-slash text-[18px]"></i>'
          : '<i class="fa-regular fa-eye text-[18px]"></i>';
        btn.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
      });
    });
  }

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
