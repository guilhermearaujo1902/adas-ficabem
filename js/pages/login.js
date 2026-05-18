/**
 * Tela: Boas-vindas (login.html)
 * Funcionalidades (roteiro):
 * - Botão "Entrar" → feed (login simulado com usuária demo se necessário)
 * - Botão "Tenho convite" → tela de convite
 */

(function initLoginPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.getElementById("welcome-actions");
    if (!footer) return;

    const buttons = footer.querySelectorAll("button");
    const btnEntrar = buttons[0];
    const btnConvite = buttons[1];

    /**
     * Garante uma usuária logada para demonstração acadêmica.
     * Cria perfil demo se ainda não existir ninguém cadastrado.
     */
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
      });
    }

    if (btnEntrar) {
      btnEntrar.addEventListener("click", () => {
        ensureDemoSession();
        FicaBemNav.go("feed");
      });
    }

    if (btnConvite) {
      btnConvite.addEventListener("click", () => {
        FicaBemNav.go("convite");
      });
    }
  });
})();
