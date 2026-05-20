/**
 * login.html — Entrar → feed | Tenho convite → convite
 */
(function initLoginPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.getElementById("welcome-actions");
    if (!footer) return;

    const [btnEntrar, btnConvite] = footer.querySelectorAll("button");

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

    btnEntrar?.addEventListener("click", () => {
      ensureDemoSession();
      FicaBemNav.go("feed");
    });

    btnConvite?.addEventListener("click", () => {
      FicaBemNav.go("convite");
    });
  });
})();
