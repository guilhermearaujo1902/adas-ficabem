/**
 * avaliacao-4.html — Comentário e visibilidade → etapa 5
 */
(function initAvaliacao4() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindCancel();
    AvaliacaoFlow.bindSkip(4);
    bindVisibilityToggles();

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

  function bindVisibilityToggles() {
    document.querySelectorAll("button, [data-visibility]").forEach((el) => {
      const t = (el.textContent || el.dataset.visibility || "").toLowerCase();
      if (!t.includes("públic") && !t.includes("anôn")) return;
      el.addEventListener("click", () => {
        document
          .querySelectorAll("[data-visibility-group] button, .ring-2")
          .forEach((b) => b.classList.remove("ring-2", "ring-brand-300"));
        el.classList.add("ring-2", "ring-brand-300");
      });
    });
  }
})();
