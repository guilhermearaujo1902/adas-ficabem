/**
 * Avaliação — Etapa 5/7: Fotos e autoria
 * Registra consentimento de uso das imagens.
 */

(function initAvaliacao5() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(5);

    AvaliacaoFlow.bindNext("avaliacao6", () => {
      const consent = document.querySelector('input[type="checkbox"]');
      const files = document.querySelector('input[type="file"]');
      FicaBemDB.updateDraftReview({
        step5: {
          photoConsent: consent ? consent.checked : false,
          photos: files?.files?.length ? Array.from(files.files).map((f) => f.name) : [],
        },
      });
    });
  });
})();
