/**
 * Avaliação — Etapa 3/7: Detalhes do estabelecimento
 * Registra critérios avaliados e avança para etapa 4.
 */

(function initAvaliacao3() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(3);
    AvaliacaoFlow.bindNext("avaliacao4", () => {
      FicaBemDB.updateDraftReview({ step3: AvaliacaoFlow.collectFormData() });
    });
  });
})();
