/**
 * detalhe.html — Detalhes, Iniciar Rota, Avaliar
 */
(function initDetalhePage() {
  document.addEventListener("DOMContentLoaded", () => {
    const placeId = FicaBemNav.getQueryParam("place") || "place-1";
    const place = FicaBemDB.getPlaceById(placeId) || FicaBemDB.getPlaces()[0];

    if (place) {
      FicaBemDB.startReviewForPlace(place.id);
      renderPlace(place);
      renderReviews(place.id);
    }

    bindBack();
    bindActions(place);
  });

  function bindBack() {
    document
      .querySelector("#details-header button")
      ?.addEventListener("click", () => FicaBemNav.go("explorar"));
  }

  function renderPlace(place) {
    const h1 = document.querySelector("#visual-header-info h1, main h1");
    if (h1) h1.textContent = place.name;

    const addr = document.querySelector("#visual-header-info p.font-sans");
    if (addr && place.address) addr.textContent = place.address;

    const rating = document.querySelector(
      "#visual-header-info .bg-brand-accent span.font-bold"
    );
    if (rating) rating.textContent = String(place.rating);

    document.title = `${place.name} - Fica Bem`;
  }

  function renderReviews(placeId) {
    const reviews = FicaBemDB.getReviewsForPlace(placeId);
    const list = document.querySelector("#recent-reviews-list");
    if (!list || !reviews.length) return;

    const items = list.querySelectorAll(".glass-effect, .glass-card");
    reviews.slice(0, 3).forEach((r, i) => {
      const card = items[i];
      if (!card) return;
      const user = card.querySelector(".font-semibold, .font-medium");
      const text = card.querySelector("p.text-white\\/70, p.text-sm");
      if (user) user.textContent = r.anonymous ? "Anônima" : r.userName;
      if (text && r.comment) text.textContent = r.comment;
    });
  }

  function bindActions(place) {
    document.querySelectorAll("#action-footer-buttons button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const text = (btn.textContent || "").toLowerCase();
        if (text.includes("rota")) {
          e.preventDefault();
          FicaBemNav.go("rota", { place: place.id });
        } else if (text.includes("avaliar")) {
          e.preventDefault();
          FicaBemNav.go("avaliacao1");
        }
      });
    });
  }
})();
