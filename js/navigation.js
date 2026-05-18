/**
 * =============================================================================
 * FICA BEM — Navegação entre telas
 * =============================================================================
 * Centraliza rotas e proteção de páginas que exigem login.
 *
 * @namespace FicaBemNav
 */

const FicaBemNav = (function () {
  const ROUTES = {
    login: "../pages/login.html",
    feed: "../pages/feed.html",
    convite: "../pages/convite.html",
    criarPerfil: "../pages/criar-perfil.html",
    explorar: "../pages/explorar.html",
    detalhe: "../pages/detalhe.html",
    rota: "../pages/rota.html",
    perfil: "../pages/perfil.html",
    filtro: "../pages/filtro.html",
    avaliacao1: "../pages/avaliacao-1.html",
    avaliacao2: "../pages/avaliacao-2.html",
    avaliacao3: "../pages/avaliacao-3.html",
    avaliacao4: "../pages/avaliacao-4.html",
    avaliacao5: "../pages/avaliacao-5.html",
    avaliacao6: "../pages/avaliacao-6.html",
    avaliacao7: "../pages/avaliacao-7.html",
  };

  const AUTH_REQUIRED = new Set([
    "feed",
    "explorar",
    "detalhe",
    "rota",
    "perfil",
    "filtro",
    "avaliacao-1",
    "avaliacao-2",
    "avaliacao-3",
    "avaliacao-4",
    "avaliacao-5",
    "avaliacao-6",
    "avaliacao-7",
  ]);

  /**
   * Redireciona para uma rota nomeada.
   * @param {string} routeName - Chave em ROUTES (ex: "feed")
   * @param {Object} [query] - Parâmetros de query string opcionais
   */
  function go(routeName, query) {
    const base = ROUTES[routeName];
    if (!base) {
      console.warn("[FicaBemNav] Rota desconhecida:", routeName);
      return;
    }
    const params = query
      ? "?" +
        Object.entries(query)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      : "";
    window.location.href = base + params;
  }

  /**
   * Verifica se há usuário logado; redireciona para login se necessário.
   * @param {string} pageId - Valor de data-page da tela atual
   */
  function requireAuth(pageId) {
    if (!AUTH_REQUIRED.has(pageId)) return;
    if (!FicaBemDB.getCurrentUser()) {
      go("login");
    }
  }

  /**
   * Obtém parâmetro da URL (ex: ?place=place-1).
   * @param {string} key - Nome do parâmetro
   * @returns {string|null} Valor ou null
   */
  function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  /**
   * Inicializa proteção de rota na carga da página.
   */
  function initAuthGuard() {
    const pageId = document.body.dataset.page;
    if (pageId) requireAuth(pageId);
  }

  document.addEventListener("DOMContentLoaded", initAuthGuard);

  return { go, getQueryParam, requireAuth, ROUTES };
})();

if (typeof window !== "undefined") {
  window.FicaBemNav = FicaBemNav;
}
