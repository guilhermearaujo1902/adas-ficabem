/**
 * Utilitários compartilhados do app Fica Bem.
 * @namespace FicaBemApp
 */
const FicaBemApp = (function () {
  const CATEGORY_BY_LABEL = {
    cafés: "cafes",
    cafes: "cafes",
    café: "cafes",
    bares: "bares",
    bar: "bares",
    transporte: "transporte",
    restaurantes: "restaurantes",
    coworking: "coworking",
    parque: "parques",
    parques: "parques",
    loja: "lojas",
    lojas: "lojas",
    todos: "todos",
  };

  const FILTER_KEY = "ficabem_filter_category";

  /**
   * @param {string[]} labels
   * @param {ParentNode} [root]
   * @returns {HTMLElement|null}
   */
  function findButton(labels, root = document) {
    const norm = labels.map((l) => l.toLowerCase());
    return Array.from(root.querySelectorAll("button, a[role='button']")).find((el) => {
      const text = (el.textContent || "").trim().toLowerCase();
      return norm.some((l) => text.includes(l));
    }) || null;
  }

  /**
   * Botão principal de avanço (rodapé fixo ou CTA largo).
   */
  function findPrimaryActionButton(labels = ["próximo", "continuar", "criar conta", "publicar"]) {
    const footerBtn = document.querySelector(
      ".absolute.bottom-\\[84px\\] button, .absolute.bottom-\\[84px\\] + * button"
    );
    const candidates = Array.from(
      document.querySelectorAll("button.w-full, #step-actions button, #btn-publicar")
    );
    const pool = [...candidates, footerBtn].filter(Boolean);
    return (
      pool.find((btn) => {
        const t = (btn.textContent || "").toLowerCase();
        return labels.some((l) => t.includes(l));
      }) || findButton(labels)
    );
  }

  /**
   * @param {string} labelText
   * @returns {string|null}
   */
  function categoryFromLabel(labelText) {
    const lower = String(labelText).toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_BY_LABEL)) {
      if (lower.includes(key)) return value;
    }
    return null;
  }

  function getSavedFilter() {
    return sessionStorage.getItem(FILTER_KEY);
  }

  function setSavedFilter(category) {
    if (!category || category === "todos") {
      sessionStorage.removeItem(FILTER_KEY);
    } else {
      sessionStorage.setItem(FILTER_KEY, category);
    }
  }

  /**
   * Marca chip/botão ativo e remove dos demais.
   */
  function setActiveChip(active, group) {
    group.forEach((el) => {
      el.classList.remove(
        "chip--active",
        "bg-white",
        "text-brand-dark",
        "text-brand-600",
        "shadow-sm"
      );
      el.classList.add("glass-panel", "text-white");
    });
    active.classList.add("bg-white", "text-brand-dark", "chip--active");
    active.classList.remove("glass-panel");
  }

  /**
   * Vincula cliques em cards de locais.
   */
  function bindPlaceNavigation(root = document, selector = "[data-place-id]") {
    root.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.boundPlace) return;
      const id = el.dataset.placeId;
      if (!id) return;

      el.dataset.boundPlace = "1";
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        FicaBemDB.startReviewForPlace(id);
        FicaBemNav.go("detalhe", { place: id });
      });
    });
  }

  /**
   * Sincroniza locais do HTML estático com o banco (explorar / avaliação).
   */
  function syncPlacesFromDom() {
    document.querySelectorAll("article h3, .list-row .font-semibold, .list-row .font-medium").forEach((titleEl) => {
      const name = titleEl.textContent.trim();
      if (!name) return;
      FicaBemDB.ensurePlace({ name });
    });
  }

  /**
   * Bottom sheet (modal-overlay + modal-content) dentro de #auth-welcome.
   * @param {object} options
   * @param {string} [options.sheetId]
   * @param {string} [options.title]
   * @param {string} [options.message]
   * @param {string} [options.iconClass] classes Font Awesome no ícone
   * @param {string} [options.primaryText]
   * @param {string} [options.cancelText]
   * @param {boolean} [options.showCancel]
   * @param {() => void} [options.onPrimary]
   * @param {() => void} [options.onClose]
   */
  function openBottomSheet(options = {}) {
    const {
      sheetId = "app-bottom-sheet",
      title = "",
      message = "",
      iconClass = "fa-solid fa-circle-check",
      primaryText = "Entendi",
      cancelText = "Fechar",
      showCancel = true,
      onPrimary = null,
      onClose = null,
    } = options;

    const overlay = document.getElementById(sheetId);
    if (!overlay) return null;

    const titleEl = overlay.querySelector("[data-sheet-title]");
    const messageEl = overlay.querySelector("[data-sheet-message]");
    const iconWrap = overlay.querySelector("[data-sheet-icon]");
    const iconEl = overlay.querySelector("[data-sheet-icon] i");
    const primaryBtn = overlay.querySelector("[data-sheet-primary]");
    const cancelBtn = overlay.querySelector("[data-sheet-cancel]");

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (iconEl && iconClass) iconEl.className = iconClass;
    if (iconWrap) iconWrap.classList.toggle("hidden", !iconClass);
    if (primaryBtn) primaryBtn.textContent = primaryText;
    if (cancelBtn) {
      cancelBtn.textContent = cancelText;
      cancelBtn.classList.toggle("hidden", !showCancel);
    }

    const close = () => {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      onClose?.();
    };

    if (primaryBtn) {
      primaryBtn.onclick = () => {
        if (onPrimary) onPrimary({ close });
        else close();
      };
    }
    if (cancelBtn) {
      cancelBtn.onclick = close;
    }

    if (!overlay.dataset.sheetBound) {
      overlay.dataset.sheetBound = "1";
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeBottomSheet(sheetId);
      });
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");

    return { close, overlay };
  }

  function closeBottomSheet(sheetId = "app-bottom-sheet") {
    const overlay = document.getElementById(sheetId);
    if (!overlay) return;
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }

  /**
   * Olho aberto = senha visível; olho riscado = senha oculta.
   */
  function syncPasswordToggleIcon(btn, visible) {
    btn.innerHTML = visible
      ? '<i class="fa-regular fa-eye text-[18px]"></i>'
      : '<i class="fa-regular fa-eye-slash text-[18px]"></i>';
    btn.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
  }

  function bindPasswordToggles(root = document) {
    root.querySelectorAll(".password-field__toggle, .auth-toggle-password").forEach((btn) => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      syncPasswordToggleIcon(btn, input.type === "text");

      if (btn.dataset.boundPassword) return;
      btn.dataset.boundPassword = "1";

      btn.addEventListener("click", () => {
        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        syncPasswordToggleIcon(btn, input.type === "text");
      });
    });
  }

  function showToast(message) {
    let toast = document.getElementById("ficabem-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ficabem-toast";
      toast.className =
        "fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-brand-dark/95 text-white text-sm px-4 py-2 rounded-xl border border-white/20 shadow-lg max-w-[90%] text-center pointer-events-none opacity-0 transition-opacity duration-300";
      document.querySelector(".phone-screen")?.appendChild(toast) ||
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 2800);
  }

  return {
    CATEGORY_BY_LABEL,
    FILTER_KEY,
    findButton,
    findPrimaryActionButton,
    categoryFromLabel,
    getSavedFilter,
    setSavedFilter,
    setActiveChip,
    bindPlaceNavigation,
    bindPasswordToggles,
    syncPasswordToggleIcon,
    syncPlacesFromDom,
    showToast,
    openBottomSheet,
    closeBottomSheet,
  };
})();

if (typeof window !== "undefined") {
  window.FicaBemApp = FicaBemApp;
}
