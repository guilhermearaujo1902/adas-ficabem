/**
 * explorar.html — Filtros, lista/mapa, clique → detalhe
 */
(function initExplorarPage() {
  document.addEventListener("DOMContentLoaded", () => {
    FicaBemApp.syncPlacesFromDom();
    bindFilterButton();
    bindViewToggle();
    bindArticles();
    renderPlacesList(FicaBemApp.getSavedFilter());
  });

  function bindFilterButton() {
    document
      .getElementById("btn-filtro-avancado")
      ?.addEventListener("click", () => FicaBemNav.go("filtro"));
  }

  function bindViewToggle() {
    const toggles = document.querySelectorAll("#explorar-view-toggle button");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        toggles.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        const isMap = (btn.textContent || "").toLowerCase().includes("mapa");
        document.body.classList.toggle("view-map", isMap);
        const content = document.getElementById("explorar-content");
        if (content) {
          content.classList.toggle("hidden", isMap);
        }
        let mapView = document.getElementById("explorar-map-view");
        if (isMap && !mapView) {
          mapView = document.createElement("section");
          mapView.id = "explorar-map-view";
          mapView.className =
            "content flex flex-col items-center justify-center text-white/70 min-h-[200px]";
          mapView.innerHTML =
            '<i class="fa-regular fa-map text-4xl mb-3"></i><p class="text-sm font-sans">Visualização em mapa (simulada)</p>';
          document.getElementById("auth-welcome")?.insertBefore(
            mapView,
            document.getElementById("bottom-nav")
          );
        }
        if (mapView) mapView.classList.toggle("hidden", !isMap);
      });
    });
  }

  function bindArticles() {
    document.querySelectorAll("#explorar-content article").forEach((article, index) => {
      const name = article.querySelector("h3")?.textContent?.trim();
      if (!name) return;
      const place = FicaBemDB.ensurePlace({ name });
      article.dataset.placeId = place.id;
      article.style.cursor = "pointer";
      article.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        FicaBemDB.startReviewForPlace(place.id);
        FicaBemNav.go("detalhe", { place: place.id });
      });
    });
  }

  function renderPlacesList(category) {
    const section = document.getElementById("explorar-content");
    if (!section) return;

    const places = FicaBemDB.getPlaces(category);
    const existing = section.querySelectorAll("article");
    existing.forEach((el, i) => {
      if (places[i]) {
        el.dataset.placeId = places[i].id;
        const h3 = el.querySelector("h3");
        if (h3) h3.textContent = places[i].name;
      }
    });
  }
})();
