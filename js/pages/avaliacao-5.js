/**
 * avaliacao-5.html — Fotos e autoria → etapa 6
 */
(function initAvaliacao5() {
  let photoHelper = null;

  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(5);
    AvaliacaoFlow.bindSkip(5);
    photoHelper = AvaliacaoFlow.bindPhotoStep();

    AvaliacaoFlow.bindNext("avaliacao6", () => {
      const consent = document.querySelector(
        "#avaliar-content input.checkbox-custom, #avaliar-content input[type='checkbox']"
      );
      const photoData = photoHelper?.getPhotoData() || { photos: [], photoData: [], coverIndex: 0 };
      FicaBemDB.updateDraftReview({
        step5: {
          photoConsent: consent ? consent.checked : true,
          photos: photoData.photos,
          photoData: photoData.photoData,
          coverIndex: photoData.coverIndex,
        },
      });
    });
  });
})();
