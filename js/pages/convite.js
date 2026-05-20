/**
 * convite.html — Validar convite → criar perfil | Compartilhar QR/link
 */
(function initConvitePage() {
  const SHEET_ID = "convite-bottom-sheet";

  document.addEventListener("DOMContentLoaded", () => {
    bindBack();
    renderPendingInvites();
    bindValidate();
    bindShare();
  });

  function openSheet(options) {
    return FicaBemApp.openBottomSheet({ sheetId: SHEET_ID, ...options });
  }

  function bindBack() {
    document.querySelector("#route-header button")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (FicaBemDB.getCurrentUser()) FicaBemNav.go("perfil");
      else FicaBemNav.go("login");
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatSentAt(iso) {
    if (!iso) return "";
    const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (days <= 0) return "Enviado hoje";
    return `Enviado há ${days} dia${days > 1 ? "s" : ""}`;
  }

  function renderPendingInvites() {
    const container = document.querySelector("#pending-invites .flex.flex-col.gap-3");
    if (!container) return;

    const pending = FicaBemDB.getPendingInvites();
    const countEl = document.querySelector("#pending-invites span.text-white\\/50");

    if (countEl) countEl.textContent = `${pending.length} aguardando`;

    if (!pending.length) {
      container.innerHTML =
        '<p class="text-white/60 text-sm font-sans">Nenhum convite pendente.</p>';
      return;
    }

    container.innerHTML = pending
      .map((inv) => {
        const label = inv.label || inv.email || inv.code;
        const ago = formatSentAt(inv.sentAt);
        const agoHtml = ago
          ? `<span class="font-sans text-[10px] text-white/40">${escapeHtml(ago)}</span>`
          : "";
        return [
          '<div class="glass-effect rounded-[16px] p-4 flex items-center justify-between border-white/5">',
          '<div class="flex items-center gap-3">',
          '<div class="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center text-white/40 border border-white/10">',
          '<i class="fa-solid fa-ticket text-lg"></i>',
          "</div>",
          '<div class="flex flex-col">',
          `<span class="font-sans text-sm font-medium text-white">${escapeHtml(label)}</span>`,
          `<span class="font-sans text-[10px] text-white/50 font-mono">${escapeHtml(inv.code)}</span>`,
          agoHtml,
          "</div>",
          "</div>",
          `<button type="button" class="px-3 py-1.5 rounded-[8px] bg-white/10 border border-white/10 font-sans text-xs text-white" data-remind="${inv.id}" data-remind-label="${escapeHtml(label)}">`,
          "Lembrar",
          "</button>",
          "</div>",
        ]
          .join("");
      })
      .join("");

    container.querySelectorAll("[data-remind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-remind-label") || "sua amiga";
        openSheet({
          title: "Lembrete enviado",
          message: `Enviamos um lembrete para ${label}. Ela receberá uma notificação para aceitar o convite.`,
          iconClass: "fa-solid fa-bell",
          primaryText: "Entendi",
          showCancel: false,
        });
      });
    });
  }

  function bindValidate() {
    const input = document.querySelector("#have-code-section input[type='text']");
    document.getElementById("btn-validate-invite")?.addEventListener("click", () => {
      const code = input?.value || "";
      if (!FicaBemDB.validateInvite(code)) {
        openSheet({
          title: "Código inválido",
          message:
            "Não encontramos esse convite. Confira o código e tente novamente. Exemplos válidos: FICABEM2025 ou MARIA92.",
          iconClass: "fa-solid fa-circle-xmark",
          primaryText: "Tentar novamente",
          cancelText: "Fechar",
          showCancel: true,
        });
        return;
      }

      FicaBemDB.storePendingInviteCode(code);
      openSheet({
        title: "Convite válido!",
        message: "Ótimo! Agora você pode criar seu perfil e entrar na rede Fica Bem.",
        iconClass: "fa-solid fa-circle-check",
        primaryText: "Criar perfil",
        showCancel: false,
        onPrimary: ({ close }) => {
          close();
          FicaBemNav.go("criarPerfil");
        },
      });
    });
  }

  function bindShare() {
    const user = FicaBemDB.getCurrentUser();
    const invite = user ? FicaBemDB.createInvite(user.id) : { code: "FICABEM2025" };

    const linkEl = document.querySelector("#hero-invite .truncate");
    const shareUrl = `${location.origin}${location.pathname.replace(/[^/]+$/, "")}convite.html?code=${invite.code}`;
    if (linkEl) linkEl.textContent = `ficabem.app/invite/${invite.code}`;

    document.getElementById("btn-copy-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      const copy = () => {
        openSheet({
          title: "Link copiado!",
          message: `O link foi copiado para a área de transferência. Compartilhe com suas amigas para entrarem no Fica Bem.`,
          iconClass: "fa-regular fa-copy",
          primaryText: "Entendi",
          showCancel: false,
        });
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareUrl).then(copy).catch(copy);
      } else {
        copy();
      }
    });

    const prefill = new URLSearchParams(location.search).get("code");
    const codeInput = document.querySelector("#have-code-section input[type='text']");
    if (prefill && codeInput) codeInput.value = prefill;
  }
})();
