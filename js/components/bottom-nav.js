/**
 * =============================================================================
 * Barra de navegação inferior (componente compartilhado)
 * =============================================================================
 * Injeta os links de navegação conforme a tela ativa.
 */

(function initBottomNav() {
  const NAV_ITEMS = [
    { id: "feed", icon: "fa-house", label: "Feed", route: "feed" },
    { id: "explorar", icon: "fa-map-location-dot", label: "Explorar", route: "explorar" },
    { id: "rota", icon: "fa-route", label: "Rota", route: "rota" },
    { id: "perfil", icon: "fa-user", label: "Perfil", route: "perfil" },
  ];

  /**
   * Monta o HTML da barra inferior.
   * @param {string} activePage - Página atual (data-page)
   * @returns {string} HTML da navegação
   */
  function buildNavHtml(activePage) {
    return NAV_ITEMS.map((item) => {
      const isActive =
        activePage === item.id ||
        (activePage === "detalhe" && item.id === "explorar") ||
        (activePage.startsWith("avaliacao") && item.id === "explorar");
      const activeClass = isActive ? " bottom-nav__link--active" : "";
      const iconStyle = item.id === "perfil" && !isActive ? "fa-regular" : "fa-solid";
      return `
        <a href="javascript:void(0)" class="bottom-nav__link${activeClass}" data-nav="${item.route}">
          <i class="${iconStyle} ${item.icon}"></i>
          <span>${item.label}</span>
        </a>`;
    }).join("");
  }

  /**
   * Associa cliques aos links da barra.
   * @param {HTMLElement} nav - Elemento nav
   */
  function bindNavClicks(nav) {
    nav.querySelectorAll("[data-nav]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        FicaBemNav.go(link.dataset.nav);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("bottom-nav");
    if (!nav) return;
    const pageId = document.body.dataset.page || "";
    nav.className = "bottom-nav";
    nav.innerHTML = buildNavHtml(pageId);
    bindNavClicks(nav);
  });
})();
