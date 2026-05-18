/**
 * Avaliação — Etapa 7/7: Revisão final
 * Exibe resumo e publica avaliação no localStorage → feed.
 */

(function initAvaliacao7() {
  document.addEventListener("DOMContentLoaded", () => {
    renderSummary();
    bindPublish();
  });

  /**
   * Monta resumo da avaliação na tela de revisão.
   */
  function renderSummary() {
    const draft = FicaBemDB.getDraftReview();
    if (!draft) return;

    const main = document.querySelector("main");
    if (!main) return;

    let box = document.getElementById("review-summary");
    if (!box) {
      box = document.createElement("section");
      box.id = "review-summary";
      box.className = "px-4 py-3 mx-4 glass-panel rounded-2xl mb-4";
      main.prepend(box);
    }

    box.innerHTML = `
      <h3 class="font-semibold text-white mb-2">Resumo</h3>
      <p class="text-sm text-white/80"><strong>Local:</strong> ${draft.placeName || "—"}</p>
      <p class="text-sm text-white/80"><strong>Comentário:</strong> ${draft.step4?.comment || "—"}</p>
      <p class="text-sm text-white/80"><strong>Visibilidade:</strong> ${
        draft.step4?.visibility === "anonymous" ? "Anônima" : "Pública"
      }</p>
      <p class="text-sm text-white/80"><strong>Recomenda:</strong> ${
        draft.step6?.recommend === true ? "Sim" : draft.step6?.recommend === false ? "Não" : "—"
      }</p>`;
  }

  /**
   * Publica avaliação e redireciona ao feed.
   */
  function bindPublish() {
    const btn = AvaliacaoFlow.findButton(["Publicar", "publicar"]);
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const published = FicaBemDB.publishReview();
      if (!published) {
        alert("Não foi possível publicar. Faça login novamente.");
        FicaBemNav.go("login");
        return;
      }
      alert("Avaliação publicada com sucesso!");
      FicaBemNav.go("feed");
    });
  }
})();
