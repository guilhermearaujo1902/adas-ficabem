/**
 * avaliacao-7.html — Revisão e publicar → feed
 */
(function initAvaliacao7() {
  document.addEventListener("DOMContentLoaded", () => {
    AvaliacaoFlow.bindBack(7);
    renderSummary();
    bindPublish();
  });

  function renderSummary() {
    const draft = FicaBemDB.getDraftReview();
    if (!draft) return;

    let box = document.getElementById("review-summary");
    if (!box) {
      box = document.createElement("section");
      box.id = "review-summary";
      box.className = "glass-panel rounded-2xl p-4 mb-4 border border-white/10";
      const content = document.getElementById("avaliar-content");
      content?.prepend(box);
    }

    const sentiments = (draft.step2?.sentiments || []).join(", ") || "—";
    const photos = (draft.step5?.photos || []).length;
    const tags = (draft.step6?.environmentTags || []).join(", ") || "—";

    box.innerHTML = `
      <h3 class="font-semibold text-white mb-3">Resumo da avaliação</h3>
      <ul class="text-sm text-white/80 space-y-1.5">
        <li><strong>Local:</strong> ${draft.placeName || "—"}</li>
        <li><strong>Nota:</strong> ${draft.step2?.overallStars || "—"} estrelas</li>
        <li><strong>Sentimentos:</strong> ${sentiments}</li>
        <li><strong>Comentário:</strong> ${draft.step4?.comment || "—"}</li>
        <li><strong>Publicação:</strong> ${
          draft.step4?.visibility === "anonymous" ? "Anônima" : "Pública"
        }</li>
        <li><strong>Tags:</strong> ${tags}</li>
        <li><strong>Fotos:</strong> ${photos} anexada(s)</li>
        <li><strong>Recomenda:</strong> ${
          draft.step6?.recommend === true
            ? "Sim"
            : draft.step6?.recommend === false
              ? "Não"
              : "—"
        }</li>
        ${
          draft.skippedSteps?.length
            ? `<li class="text-white/50 text-xs">Etapas puladas: ${draft.skippedSteps.join(", ")}</li>`
            : ""
        }
      </ul>`;
  }

  function bindPublish() {
    const btn =
      document.getElementById("btn-publicar") ||
      FicaBemApp.findButton(["publicar"]);

    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      const published = FicaBemDB.publishReview();
      if (!published) {
        alert("Não foi possível publicar. Faça login novamente.");
        FicaBemNav.go("login");
        return;
      }

      const modal = document.getElementById("success-modal");
      if (modal) modal.classList.add("active");

      FicaBemApp.showToast("Avaliação publicada!");
      setTimeout(() => FicaBemNav.go("feed"), 800);
    });
  }
})();
