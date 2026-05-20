/**
 * avaliacao-2.html — Sentimentos → etapa 3
 */
(function initAvaliacao2() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(2);
    bindSentimentChips();

    AvaliacaoFlow.bindNext("avaliacao3", () => {
      FicaBemDB.updateDraftReview({
        step2: {
          ...AvaliacaoFlow.collectFormData(),
          sentiments: AvaliacaoFlow.collectSentiments(),
        },
      });
    });
  });

  function bindSentimentChips() {
    document.querySelectorAll(".sentiment-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        chip.classList.toggle("border-brand-300");
      });
    });
  }
})();
