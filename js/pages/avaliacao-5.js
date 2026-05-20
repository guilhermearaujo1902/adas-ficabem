/**
 * avaliacao-5.html — Fotos e autoria → etapa 6
 */
(function initAvaliacao5() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(5);

    AvaliacaoFlow.bindNext("avaliacao6", () => {
      const consent = document.querySelector('input[type="checkbox"]');
      const files = document.querySelector('input[type="file"]');
      FicaBemDB.updateDraftReview({
        step5: {
          photoConsent: consent ? consent.checked : false,
          photos: files?.files?.length
            ? Array.from(files.files).map((f) => f.name)
            : [],
        },
      });
    });
  });
})();
