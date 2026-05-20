/**
 * rota.html — Mapa, alertas, locais em alta, últimas avaliações
 */
(function initRotaPage() {
  document.addEventListener("DOMContentLoaded", () => {
    const placeId = FicaBemNav.getQueryParam("place");
    if (placeId) highlightDestination(placeId);

    renderAlertsInSheet();
    renderTrendingPlaces();
    renderRecentReviews();
    bindBack();
  });

  function bindBack() {
    document
      .querySelector("#rota-header button")
      ?.addEventListener("click", () => FicaBemNav.go("feed"));
  }

  function highlightDestination(placeId) {
    const place = FicaBemDB.getPlaceById(placeId);
    if (!place) return;
    const dest = document.querySelector("#route-bottom-sheet h3");
    if (dest) dest.textContent = place.name;
    const addr = document.querySelector("#route-bottom-sheet p.text-\\[13px\\]");
    if (addr && place.address) addr.textContent = place.address;
  }

  function renderAlertsInSheet() {
    const sheet = document.querySelector("#route-bottom-sheet .space-y-6");
    if (!sheet) return;

    let block = document.getElementById("rota-alerts-block");
    if (!block) {
      block = document.createElement("div");
      block.id = "rota-alerts-block";
      block.className = "space-y-2";
      sheet.insertBefore(block, sheet.firstChild?.nextSibling?.nextSibling || sheet.firstChild);
    }

    const alerts = FicaBemDB.getAlerts();
    block.innerHTML = `<h3 class="text-[14px] font-medium text-white/90">Pontos de atenção</h3>${alerts
      .map(
        (a) =>
          `<p class="text-xs text-white/75 border-l-2 border-brand-300 pl-2">${a.text} <span class="text-white/40">(${a.time})</span></p>`
      )
      .join("")}`;
  }

  function renderTrendingPlaces() {
    const sheet = document.querySelector("#route-bottom-sheet .space-y-6");
    if (!sheet) return;

    let block = document.getElementById("rota-trending-block");
    if (!block) {
      block = document.createElement("div");
      block.id = "rota-trending-block";
      block.className = "space-y-2";
      sheet.appendChild(block);
    }

    const places = FicaBemDB.getPlaces().slice(0, 3);
    block.innerHTML = `<h3 class="text-[14px] font-medium text-white/90">Locais em alta no mapa</h3>${places
      .map(
        (p) =>
          `<button type="button" class="w-full text-left text-xs text-white/80 py-1 hover:text-brand-300" data-place-id="${p.id}">• ${p.name} (${p.rating}★)</button>`
      )
      .join("")}`;

    block.querySelectorAll("[data-place-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        FicaBemNav.go("detalhe", { place: btn.dataset.placeId });
      });
    });
  }

  function renderRecentReviews() {
    const sheet = document.querySelector("#route-bottom-sheet .space-y-6");
    if (!sheet) return;

    let block = document.getElementById("rota-reviews-block");
    if (!block) {
      block = document.createElement("div");
      block.id = "rota-reviews-block";
      block.className = "space-y-2";
      sheet.appendChild(block);
    }

    const reviews = FicaBemDB.getReviews().slice(0, 4);
    if (!reviews.length) {
      block.innerHTML =
        '<h3 class="text-[14px] font-medium text-white/90">Últimas avaliações</h3><p class="text-xs text-white/50">Nenhuma avaliação publicada ainda.</p>';
      return;
    }

    block.innerHTML = `<h3 class="text-[14px] font-medium text-white/90">Últimas avaliações</h3>${reviews
      .map(
        (r) =>
          `<p class="text-xs text-white/75">${r.placeName} — ${r.anonymous ? "Anônima" : r.userName}</p>`
      )
      .join("")}`;
  }
})();
