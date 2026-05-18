/**
 * Tela: Detalhe do estabelecimento (detalhe.html)
 * Funcionalidades (roteiro):
 * - Exibir dados do local selecionado
 * - "Iniciar Rota" → rota.html
 * - "Avaliar este local" → avaliacao-1.html
 */

(function initDetalhePage() {
  document.addEventListener("DOMContentLoaded", () => {
    const placeId = FicaBemNav.getQueryParam("place") || "place-1";
    const place = FicaBemDB.getPlaceById(placeId);

    if (place) {
      renderPlaceDetails(place);
      FicaBemDB.updateDraftReview({ placeId: place.id, placeName: place.name });
    }

    bindActionButtons(place);
  });

  /**
   * Preenche título e informações do local na página.
   * @param {Object} place - Dados do local
   */
  function renderPlaceDetails(place) {
    const title = document.querySelector("h1, h2.font-serif");
    if (title) title.textContent = place.name;

    const subtitle = document.querySelector("main p.text-white\\/60, main .text-white\\/60");
    if (subtitle) subtitle.textContent = `${place.neighborhood} • ${place.category}`;
  }

  /**
   * Vincula botões de rota e avaliação.
   * @param {Object} place - Local atual
   */
  function bindActionButtons(place) {
    document.querySelectorAll("button, a").forEach((el) => {
      const text = (el.textContent || "").toLowerCase();
      if (text.includes("iniciar rota") || text.includes("rota")) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          FicaBemNav.go("rota", { place: place?.id });
        });
      }
      if (text.includes("avaliar")) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          FicaBemNav.go("avaliacao1");
        });
      }
    });
  }
})();
