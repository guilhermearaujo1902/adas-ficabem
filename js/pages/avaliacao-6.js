/**
 * avaliacao-6.html — Recomendação → revisão
 */
(function initAvaliacao6() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(6);
    bindRecommend();

    AvaliacaoFlow.bindNext("avaliacao7", () => {
      FicaBemDB.updateDraftReview({
        step6: {
          ...AvaliacaoFlow.collectFormData(),
          recommend: getRecommendValue(),
        },
      });
    });
  });

  function bindRecommend() {
    document.querySelectorAll("button").forEach((btn) => {
      const t = (btn.textContent || "").toLowerCase();
      if (t === "sim" || t === "não" || t === "nao") {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll("[data-recommend]")
            .forEach((b) => b.classList.remove("ring-2", "ring-brand-300"));
          btn.classList.add("ring-2", "ring-brand-300");
          btn.dataset.recommend = t.includes("sim") ? "yes" : "no";
        });
      }
    });
  }

  function getRecommendValue() {
    const selected = document.querySelector("[data-recommend='yes'], [data-recommend='no']");
    if (!selected) return null;
    return selected.dataset.recommend === "yes";
  }
})();
