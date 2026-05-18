/**
 * Tela: Rota segura (rota.html)
 * Funcionalidades (roteiro):
 * - Visualizar pontos de atenção, mapa e últimas avaliações
 * - Dados carregados do localStorage
 */

(function initRotaPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const placeId = FicaBemNav.getQueryParam("place");
    renderAlerts();
    renderRecentReviews();
    if (placeId) highlightDestination(placeId);
  });

  /**
   * Lista alertas de segurança na tela.
   */
  function renderAlerts() {
    const alerts = FicaBemDB.getAlerts();
    const section = document.getElementById("safety-alerts-carousel") || document.querySelector("section");
    if (!section || !alerts.length) return;

    let row = section.querySelector(".flex.gap-4");
    if (!row) return;

    row.innerHTML = alerts
      .map((a) => {
        const tone = a.type === "danger" ? "red" : "yellow";
        return `
        <div class="min-w-[240px] bg-${tone}-500/20 border border-${tone}-500/30 rounded-2xl p-4">
          <p class="font-sans text-sm text-white">${a.text}</p>
          <span class="text-[10px] text-white/50">${a.time} • ${a.author}</span>
        </div>`;
      })
      .join("");
  }

  /**
   * Exibe últimas avaliações de locais.
   */
  function renderRecentReviews() {
    const reviews = FicaBemDB.getReviews().slice(0, 3);
    const target = document.querySelector("[data-recent-reviews]") || document.querySelector("main section:last-of-type");
    if (!target || !reviews.length) return;

    const block = document.createElement("div");
    block.className = "px-4 py-3";
    block.innerHTML = `<h3 class="text-sm font-semibold text-white/80 mb-2">Últimas avaliações</h3>
      ${reviews.map((r) => `<p class="text-xs text-white/70 mb-1">${r.placeName} — ${r.userName}</p>`).join("")}`;
    target.appendChild(block);
  }

  /**
   * Destaca destino da rota no título se houver place na URL.
   * @param {string} placeId - ID do local
   */
  function highlightDestination(placeId) {
    const place = FicaBemDB.getPlaceById(placeId);
    if (!place) return;
    const heading = document.querySelector("h1, h2");
    if (heading) heading.textContent = `Rota para ${place.name}`;
  }
})();
