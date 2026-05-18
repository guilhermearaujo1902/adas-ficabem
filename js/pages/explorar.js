/**
 * Tela: Explorar locais (explorar.html)
 * Funcionalidades (roteiro):
 * - Filtrar por categorias
 * - Alternar lista/mapa (visual)
 * - Clique em local → detalhe.html
 */

(function initExplorarPage() {
  document.addEventListener("DOMContentLoaded", () => {
    bindCategoryChips();
    bindViewToggle();
    bindPlaceCards();
    renderPlacesList();
  });

  /**
   * Filtra locais pelos chips de categoria.
   */
  function bindCategoryChips() {
    document.querySelectorAll("button").forEach((chip) => {
      const text = (chip.textContent || "").trim();
      if (!text.match(/Café|Bar|Transporte|Restaurante|Cowork/i)) return;
      chip.addEventListener("click", () => {
        document.querySelectorAll("button").forEach((b) => b.classList.remove("chip--active"));
        chip.classList.add("chip--active");
        const map = { Cafés: "cafes", Bares: "bares", Transporte: "transporte", Restaurantes: "restaurantes" };
        const key = Object.keys(map).find((k) => text.includes(k.slice(0, 4)));
        renderPlacesList(map[key] || null);
      });
    });
  }

  /**
   * Alterna visualização lista/mapa (apenas classes CSS).
   */
  function bindViewToggle() {
    const toggles = document.querySelectorAll('[class*="lista"], [class*="mapa"], button');
    toggles.forEach((btn) => {
      const t = (btn.textContent || "").toLowerCase();
      if (t.includes("lista") || t.includes("mapa")) {
        btn.addEventListener("click", () => {
          document.body.classList.toggle("view-map", t.includes("mapa"));
        });
      }
    });
  }

  /**
   * Delega clique em cards para detalhe.
   */
  function bindPlaceCards() {
    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-place-id], .place-card");
      if (!card) return;
      const id = card.dataset.placeId;
      if (id) FicaBemNav.go("detalhe", { place: id });
    });
  }

  /**
   * Lista locais do localStorage na tela.
   * @param {string|null} category - Filtro opcional
   */
  function renderPlacesList(category) {
    const main = document.querySelector("main");
    if (!main) return;

    let container = document.getElementById("explorar-places-list");
    if (!container) {
      container = document.createElement("section");
      container.id = "explorar-places-list";
      container.className = "px-6 py-4 flex flex-col gap-3";
      main.appendChild(container);
    }

    const places = FicaBemDB.getPlaces(category);
    container.innerHTML = places
      .map(
        (p) => `
      <article class="place-card" data-place-id="${p.id}">
        <div class="flex-1">
          <h3 class="font-serif font-semibold">${p.name}</h3>
          <p class="text-xs text-white/60">${p.neighborhood} • Nota ${p.rating}</p>
        </div>
        <i class="fa-solid fa-chevron-right text-white/40"></i>
      </article>`
      )
      .join("");
  }
})();
