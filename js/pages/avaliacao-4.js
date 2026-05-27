/**
 * avaliacao-4.html — Comentário e visibilidade → etapa 5
 */
(function initAvaliacao4() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(4);
    AvaliacaoFlow.bindSkip(4);
    AvaliacaoFlow.updatePlaceNameInTitles();

    AvaliacaoFlow.bindNext("avaliacao5", () => {
      const textarea = document.querySelector("textarea");
      FicaBemDB.updateDraftReview({
        step4: {
          comment: textarea?.value || "",
          visibility: AvaliacaoFlow.collectVisibility(),
        },
      });
    });
  });
})();
