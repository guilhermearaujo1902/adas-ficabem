/**
 * index.html — Boas-vindas → login | convite
 */
(function initIndexPage() {
  const LOGIN_URL = "pages/login.html";
  const CONVITE_URL = "pages/convite.html";

  function goToLogin() {
    window.location.assign(LOGIN_URL);
  }

  function goToConvite() {
    window.location.assign(CONVITE_URL);
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      FicaBemDB?.seedDemoUser?.();
    } catch (err) {
      console.error("[index]", err);
    }

    const btnEntrar = document.getElementById("btn-entrar");
    const btnConvite = document.getElementById("btn-convite");

    btnEntrar?.addEventListener("click", (e) => {
      e.preventDefault();
      goToLogin();
    });

    btnConvite?.addEventListener("click", (e) => {
      e.preventDefault();
      goToConvite();
    });
  });
})();
