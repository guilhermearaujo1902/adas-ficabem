/**
 * Avaliação — Etapa 4/7: Comentário e visibilidade
 * Salva comentário e se a publicação é pública ou anônima (localStorage).
 */

(function initAvaliacao4() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindSkip(4);

    AvaliacaoFlow.bindNext("avaliacao5", () => {
      const textarea = document.querySelector("textarea");
      const comment = textarea ? textarea.value : "";

      let visibility = "public";
      document.querySelectorAll('input[type="radio"], button').forEach((el) => {
        const t = (el.value || el.textContent || "").toLowerCase();
        if ((el.checked || el.classList.contains("ring-2")) && t.includes("anôn")) {
          visibility = "anonymous";
        }
      });

      FicaBemDB.updateDraftReview({
        step4: { comment, visibility },
      });
    });
  });
})();
