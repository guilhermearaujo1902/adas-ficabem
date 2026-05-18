/**
 * Tela: Convidar amigas / validar convite (convite.html)
 * Funcionalidades (roteiro):
 * - Validar código de convite → criar perfil
 * - Compartilhar QR/link (simulado)
 * - Listar convites pendentes do localStorage
 */

(function initConvitePage() {
  const INVITE_CODE_KEY = "ficabem_pending_invite_code";

  document.addEventListener("DOMContentLoaded", () => {
    renderPendingInvites();
    bindValidateButton();
    bindShareActions();
  });

  /**
   * Exibe convites pendentes na interface.
   */
  function renderPendingInvites() {
    const list = document.querySelector("#pending-invites-list, [data-pending-invites]");
    if (!list) return;

    const pending = FicaBemDB.getPendingInvites();
    if (!pending.length) {
      list.innerHTML = "<p class=\"text-white/60 text-sm\">Nenhum convite pendente.</p>";
      return;
    }

    list.innerHTML = pending
      .map(
        (inv) =>
          `<div class="glass-panel rounded-xl p-3 mb-2">
            <span class="text-sm font-mono">${inv.code}</span>
            <span class="text-xs text-white/50 block">Status: ${inv.status}</span>
          </div>`
      )
      .join("");
  }

  /**
   * Localiza campo de código e botão validar.
   */
  function bindValidateButton() {
    const input =
      document.querySelector('input[type="text"][placeholder*="código"]') ||
      document.querySelector('input[type="text"]');
    const validateBtn = findButtonByText(["Validar", "validar", "Confirmar"]);

    if (!validateBtn) return;

    validateBtn.addEventListener("click", () => {
      const code = input ? input.value : "";
      if (!FicaBemDB.validateInvite(code)) {
        alert("Código de convite inválido. Use: FICABEM2025");
        return;
      }
      sessionStorage.setItem(INVITE_CODE_KEY, code.trim());
      FicaBemNav.go("criarPerfil");
    });
  }

  /**
   * Simula compartilhamento de link/QR para convidar amigas.
   */
  function bindShareActions() {
    const user = FicaBemDB.getCurrentUser();
    const invite = user ? FicaBemDB.createInvite(user.id) : { code: "FICABEM2025" };
    const shareUrl = `${window.location.origin}/pages/convite.html?code=${invite.code}`;

    document.querySelectorAll("button, a").forEach((el) => {
      const text = (el.textContent || "").toLowerCase();
      if (text.includes("copiar") || text.includes("compartilhar") || text.includes("link")) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          navigator.clipboard?.writeText(shareUrl);
          alert(`Link copiado!\n${shareUrl}`);
        });
      }
    });
  }

  /**
   * Busca botão pelo texto visível.
   * @param {string[]} labels - Textos aceitos
   * @returns {HTMLElement|null}
   */
  function findButtonByText(labels) {
    return Array.from(document.querySelectorAll("button")).find((btn) =>
      labels.some((l) => (btn.textContent || "").trim().includes(l))
    );
  }
})();
