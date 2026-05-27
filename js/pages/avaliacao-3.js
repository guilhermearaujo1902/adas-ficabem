/**
 * avaliacao-3.html — Critérios do local → etapa 4
 */
(function initAvaliacao3() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(3);
    AvaliacaoFlow.bindSkip(3);
    AvaliacaoFlow.bindRangeSliders();
    AvaliacaoFlow.updatePlaceNameInTitles();

    AvaliacaoFlow.bindNext("avaliacao4", () => {
      FicaBemDB.updateDraftReview({
        step3: {
          ...AvaliacaoFlow.collectFormData(),
          ratings: AvaliacaoFlow.collectRangeRatings(),
        },
      });
    });
  });
})();
