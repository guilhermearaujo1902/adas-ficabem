/**
 * FICA BEM — Navegação entre telas
 * @namespace FicaBemNav
 */

const FicaBemNav = (function () {
  const ROUTE_FILES = {
    index: "index.html",
    login: "login.html",
    entrar: "login.html",
    feed: "feed.html",
    convite: "convite.html",
    criarPerfil: "criar-perfil.html",
    explorar: "explorar.html",
    detalhe: "detalhe.html",
    rota: "rota.html",
    perfil: "perfil.html",
    filtro: "filtro.html",
    avaliacao1: "avaliacao-1.html",
    avaliacao2: "avaliacao-2.html",
    avaliacao3: "avaliacao-3.html",
    avaliacao4: "avaliacao-4.html",
    avaliacao5: "avaliacao-5.html",
    avaliacao6: "avaliacao-6.html",
    avaliacao7: "avaliacao-7.html",
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

  function isInsidePagesFolder() {
    return /\/pages\//i.test(window.location.pathname);
  }

  function resolveHref(routeName) {
    const file = ROUTE_FILES[routeName];
    if (!file) return null;

    const inPages = isInsidePagesFolder();
    const isRootPage = routeName === "index";

    if (isRootPage) {
      return inPages ? `../${file}` : file;
    }

    return inPages ? file : `pages/${file}`;
  }

  function go(routeName, query) {
    const base = resolveHref(routeName);
    if (!base) {
      console.warn("[FicaBemNav] Rota desconhecida:", routeName);
      return;
    }

    const entries = query
      ? Object.entries(query).filter(([, v]) => v != null && v !== "")
      : [];
    const params = entries.length
      ? "?" +
        entries
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      : "";

    window.location.href = base + params;
  }

  function requireAuth(pageId) {
    if (!AUTH_REQUIRED.has(pageId)) return;
    if (!FicaBemDB.getCurrentUser()) {
      go("login");
    }
  }

  function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  function initAuthGuard() {
    const pageId = document.body.dataset.page;
    if (pageId) requireAuth(pageId);
  }

  document.addEventListener("DOMContentLoaded", initAuthGuard);

  return { go, getQueryParam, requireAuth, resolveHref, ROUTE_FILES };
})();

if (typeof window !== "undefined") {
  window.FicaBemNav = FicaBemNav;
}
