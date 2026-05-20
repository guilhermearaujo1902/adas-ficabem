/**
 * avaliacao-1.html — Local e contexto → etapa 2
 */
(function initAvaliacao1() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(1);
    AvaliacaoFlow.bindListRowSelection();

    const draft = FicaBemDB.getDraftReview();
    if (draft.placeId) highlightPlace(draft.placeName);

    AvaliacaoFlow.bindNext("avaliacao2", () => {
      const data = AvaliacaoFlow.collectFormData();
      const draftNow = FicaBemDB.getDraftReview();
      if (!draftNow.placeId) {
        const first = document.querySelector(".list-row.ring-2, .list-row");
        const name =
          first?.querySelector(".font-semibold, .font-medium")?.textContent?.trim() ||
          "Café Botânico";
        const place = FicaBemDB.ensurePlace({ name });
        FicaBemDB.updateDraftReview({ placeId: place.id, placeName: place.name });
      }
      FicaBemDB.updateDraftReview({ step1: data });
    });
  });

  function highlightPlace(name) {
    document.querySelectorAll(".list-row").forEach((row) => {
      const n = row.querySelector(".font-semibold, .font-medium")?.textContent?.trim();
      if (n === name) row.classList.add("ring-2", "ring-brand-300");
    });
  }
})();
