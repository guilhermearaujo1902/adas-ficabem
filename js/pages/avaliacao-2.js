/**
 * Avaliação — Etapa 2/7: Contexto inicial
 * Registra seleções e avança para etapa 3.
 */

(function initAvaliacao2() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(2);
    AvaliacaoFlow.bindNext("avaliacao3", () => {
      FicaBemDB.updateDraftReview({ step2: AvaliacaoFlow.collectFormData() });
    });
  });
})();
