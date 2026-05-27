/**
 * avaliacao-2.html — Sentimentos → etapa 3
 */
(function initAvaliacao2() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(2);
    AvaliacaoFlow.bindSkip(2);
    AvaliacaoFlow.bindStarRating();
    AvaliacaoFlow.updatePlaceNameInTitles();
    bindSentimentChips();

    AvaliacaoFlow.bindNext("avaliacao3", () => {
      const container = document.querySelector(".star-rating");
      FicaBemDB.updateDraftReview({
        step2: {
          ...AvaliacaoFlow.collectFormData(),
          sentiments: AvaliacaoFlow.collectSentiments(),
          overallStars: Number(container?.dataset.rating || 0),
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
