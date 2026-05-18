/**
 * Tela: Criar conta (criar-perfil.html)
 * Funcionalidades (roteiro):
 * - Preencher formulário e "Criar conta" → feed
 * - Persiste usuária no localStorage e consome convite se houver
 */

(function initCriarPerfilPage() {
  const INVITE_CODE_KEY = "ficabem_pending_invite_code";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form") || document.querySelector("main");
    const btnCriar = findButtonByText(["Criar conta", "Criar Conta"]);

    if (btnCriar) {
      btnCriar.addEventListener("click", (e) => {
        e.preventDefault();
        handleCreateAccount();
      });
    }
  });

  /**
   * Lê campos do formulário e grava novo usuário.
   */
  function handleCreateAccount() {
    const inputs = document.querySelectorAll("input");
    const data = { name: "", email: "", password: "" };

    inputs.forEach((input) => {
      const ph = (input.placeholder || "").toLowerCase();
      const name = (input.name || "").toLowerCase();
      if (ph.includes("nome") || name.includes("nome")) data.name = input.value;
      if (ph.includes("e-mail") || ph.includes("email") || input.type === "email")
        data.email = input.value;
      if (input.type === "password") data.password = input.value;
    });

    if (!data.name) data.name = "Nova Usuária";
    if (!data.email) data.email = `user${Date.now()}@ficabem.app`;
    if (!data.password) data.password = "123456";

    if (FicaBemDB.findUserByEmail(data.email)) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    FicaBemDB.createUser(data);

    const inviteCode = sessionStorage.getItem(INVITE_CODE_KEY);
    if (inviteCode) {
      FicaBemDB.consumeInvite(inviteCode);
      sessionStorage.removeItem(INVITE_CODE_KEY);
    }

    FicaBemNav.go("feed");
  }

  function findButtonByText(labels) {
    return Array.from(document.querySelectorAll("button")).find((btn) =>
      labels.some((l) => (btn.textContent || "").includes(l))
    );
  }
})();
