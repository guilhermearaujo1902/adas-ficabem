/**
 * Tela: Filtro por setor (filtro.html)
 * Funcionalidades complementares:
 * - Aplicar filtros e retornar ao feed ou explorar
 */

(function initFiltroPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const applyBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      /aplicar|confirmar|filtrar/i.test(b.textContent || "")
    );

    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[type="radio"]:checked, .chip--active');
        const value = selected?.value || selected?.textContent || "todos";
        sessionStorage.setItem("ficabem_filter_category", value);
        FicaBemNav.go("feed");
      });
    }
  });
})();
