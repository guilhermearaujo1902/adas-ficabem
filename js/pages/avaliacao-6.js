/**
 * avaliacao-6.html — Tags e contexto → revisão
 */
(function initAvaliacao6() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(6);
    AvaliacaoFlow.bindSkip(6);
    AvaliacaoFlow.bindTagAndProfileChecks();
    AvaliacaoFlow.updatePlaceNameInTitles();

    AvaliacaoFlow.bindNext("avaliacao7", () => {
      const recommendYes = document.querySelector('input[name="recommend"][value], input[name="recommend"]:checked');
      let recommend = null;
      if (recommendYes) {
        const label = recommendYes.closest("label")?.textContent?.toLowerCase() || "";
        recommend = label.includes("não") || label.includes("nao") ? false : true;
      }

      FicaBemDB.updateDraftReview({
        step6: {
          environmentTags: AvaliacaoFlow.collectChipSelections(".tag-checkbox"),
          profiles: AvaliacaoFlow.collectChipSelections(
            '#avaliar-content input.checkbox-custom:not(.tag-checkbox)'
          ),
          recommend,
        },
      });
    });
  });
})();
