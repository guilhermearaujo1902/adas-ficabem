/**
 * avaliacao-3.html — Critérios do local → etapa 4
 */
(function initAvaliacao3() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(3);
    bindRatingControls();

    AvaliacaoFlow.bindNext("avaliacao4", () => {
      const ratings = {};
      document.querySelectorAll("[data-rating]").forEach((el) => {
        ratings[el.dataset.rating] = el.dataset.value || el.textContent;
      });
      FicaBemDB.updateDraftReview({
        step3: { ...AvaliacaoFlow.collectFormData(), ratings },
      });
    });
  });

  function bindRatingControls() {
    document.querySelectorAll(".fa-star, button").forEach((star) => {
      if (!star.closest("[class*='rating'], .glass-panel")) return;
      star.addEventListener("click", () => {
        const parent = star.closest(".flex, .glass-panel");
        parent?.querySelectorAll(".fa-star").forEach((s) => {
          s.classList.remove("text-yellow-300");
        });
        star.classList.add("text-yellow-300");
      });
    });
  }
})();
