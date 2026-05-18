/**
 * Avaliação — Etapa 1/7: Seleção do local
 * Salva local escolhido e avança para etapa 2.
 */

(function initAvaliacao1() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(1);

    document.querySelectorAll("[data-place-id], .place-card, article").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.placeId;
        const name = card.querySelector("h3")?.textContent || card.textContent?.trim();
        if (id) FicaBemDB.updateDraftReview({ placeId: id, placeName: name });
      });
    });

    AvaliacaoFlow.bindNext("avaliacao2", () => {
      const data = AvaliacaoFlow.collectFormData();
      FicaBemDB.updateDraftReview({ step1: data });
      if (!FicaBemDB.getDraftReview().placeId) {
        FicaBemDB.updateDraftReview({ placeId: "place-1", placeName: "Café Botânico" });
      }
    });
  });
})();
