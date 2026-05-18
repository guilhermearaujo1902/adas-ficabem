/**
 * Avaliação — Etapa 6/7: Recomendação e contexto
 * Salva se recomenda o local e avança para revisão.
 */

(function initAvaliacao6() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(6);

    AvaliacaoFlow.bindNext("avaliacao7", () => {
      const data = AvaliacaoFlow.collectFormData();
      let recommend = null;
      document.querySelectorAll("button, input").forEach((el) => {
        const t = (el.textContent || el.value || "").toLowerCase();
        if (el.classList.contains("ring-2") || el.checked) {
          if (t.includes("sim")) recommend = true;
          if (t.includes("não") || t.includes("nao")) recommend = false;
        }
      });
      FicaBemDB.updateDraftReview({ step6: { ...data, recommend } });
    });
  });
})();
