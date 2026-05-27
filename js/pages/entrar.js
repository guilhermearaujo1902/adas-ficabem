/**
 * entrar.html — Login e cadastro (localStorage)
 */
(function initEntrarPage() {
  document.addEventListener("DOMContentLoaded", () => {
    FicaBemDB.seedDemoUser();

    if (FicaBemDB.getCurrentUser()) {
      FicaBemNav.go("feed");
      return;
    }

    const tabParam = FicaBemNav.getQueryParam("tab");
    if (tabParam === "register") switchTab("register");

    bindBack();
    bindTabs();
    bindPasswordToggles();
    bindLoginForm();
    bindRegisterForm();
  });

  function bindBack() {
    document.getElementById("auth-back")?.addEventListener("click", () => {
      FicaBemNav.go("index");
    });
  }

  function bindTabs() {
    document.querySelectorAll(".auth-tabs__btn").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
  }

  function switchTab(tab) {
    const isRegister = tab === "register";
    document.querySelectorAll(".auth-tabs__btn").forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    const loginPanel = document.getElementById("panel-login");
    const registerPanel = document.getElementById("panel-register");
    loginPanel?.classList.toggle("hidden", isRegister);
    registerPanel?.classList.toggle("hidden", !isRegister);
    if (loginPanel) loginPanel.hidden = isRegister;
    if (registerPanel) registerPanel.hidden = !isRegister;

    clearErrors();
  }

  function bindPasswordToggles() {
    FicaBemApp.bindPasswordToggles();
  }

  function bindLoginForm() {
    const form = document.getElementById("form-login");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const identifier = document.getElementById("login-identifier")?.value?.trim();
      const password = document.getElementById("login-password")?.value;

      if (!identifier || !password) {
        showError("login", "Preencha e-mail/usuário e senha.");
        return;
      }

      const result = FicaBemDB.loginWithCredentials(identifier, password);
      if (!result.ok) {
        showError("login", result.error);
        return;
      }

      FicaBemApp.showToast(`Bem-vinda, ${result.user.name.split(" ")[0]}!`);
      FicaBemNav.go("feed");
    });
  }

  function bindRegisterForm() {
    const form = document.getElementById("form-register");
    const usernameInput = document.getElementById("register-username");

    usernameInput?.addEventListener("input", () => {
      usernameInput.value = usernameInput.value.replace(/^@+/, "").replace(/\s/g, "");
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById("register-name")?.value?.trim();
      const email = document.getElementById("register-email")?.value?.trim();
      const username = document.getElementById("register-username")?.value?.trim();
      const password = document.getElementById("register-password")?.value;
      const confirm = document.getElementById("register-password-confirm")?.value;

      if (!name || !email || !username || !password || !confirm) {
        showError("register", "Preencha todos os campos.");
        return;
      }

      if (password !== confirm) {
        showError("register", "As senhas não coincidem.");
        return;
      }

      const result = FicaBemDB.registerUser({ name, email, username, password });
      if (!result.ok) {
        showError("register", result.error);
        return;
      }

      FicaBemApp.showToast("Conta criada com sucesso!");
      FicaBemNav.go("feed");
    });
  }

  function showError(panel, message) {
    const el = document.getElementById(panel === "register" ? "register-error" : "login-error");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function clearErrors() {
    document.getElementById("login-error")?.classList.add("hidden");
    document.getElementById("register-error")?.classList.add("hidden");
  }
})();
