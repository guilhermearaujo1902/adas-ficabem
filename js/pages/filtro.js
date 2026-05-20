/**
 * filtro.html — Aplicar filtros → feed / explorar
 */
(function initFiltroPage() {
  document.addEventListener("DOMContentLoaded", () => {
    bindBack();
    bindApply();
  });

  function bindBack() {
    document
      .querySelector("#setor-header button")
      ?.addEventListener("click", () => FicaBemNav.go("explorar"));
  }

  function bindApply() {
    const applyBtn = FicaBemApp.findButton(["aplicar", "confirmar", "filtrar"]);
    applyBtn?.addEventListener("click", () => {
      const active = document.querySelector(
        ".chip--active, button.bg-white, [aria-pressed='true']"
      );
      const label = active?.textContent || "todos";
      const category = FicaBemApp.categoryFromLabel(label) || "todos";
      FicaBemApp.setSavedFilter(category);
      FicaBemNav.go("feed");
    });
  }
})();
