/**
 * explorar.html — Filtros, lista/mapa, clique → detalhe
 */
(function initExplorarPage() {
  document.addEventListener("DOMContentLoaded", () => {
    FicaBemApp.syncPlacesFromDom();
    stripScoreBadges();
    removeRelevanciaSort();
    bindFilterButton();
    bindFilterChips();
    bindViewToggle();
    bindArticles();
    bindBookmarks();
    renderPlacesList(FicaBemApp.getSavedFilter());
  });

  function stripScoreBadges() {
    document
      .querySelectorAll("#explorar-content article .absolute.top-1\\.5")
      .forEach((el) => el.remove());
  }

  function removeRelevanciaSort() {
    document
      .querySelector("#explorar-content .flex.items-center.justify-between .text-\\[12px\\]")
      ?.closest(".flex.items-center.gap-1")
      ?.remove();
  }

  function bindFilterButton() {
    document
      .getElementById("btn-filtro-avancado")
      ?.addEventListener("click", () => FicaBemNav.go("filtro"));
  }

  function bindFilterChips() {
    const chips = document.querySelectorAll("#explorar-filters-scroll button");
    chips.forEach((chip, i) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.remove("bg-white", "text-brand-600", "shadow-sm");
          c.classList.add("glass-panel", "text-white");
        });
        chip.classList.add("bg-white", "text-brand-600", "shadow-sm");
        chip.classList.remove("glass-panel", "text-white");
      });
      if (i === 0) chip.click();
    });
  }

  function bindViewToggle() {
    const toggles = document.querySelectorAll("#explorar-view-toggle button");
    const header = document.getElementById("explorar-header");
    const content = document.getElementById("explorar-content");

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

        if (content) content.classList.toggle("hidden", isMap);
        if (header) header.classList.toggle("explorar-header--map", isMap);

        let mapView = document.getElementById("explorar-map-view");
        if (isMap) {
          if (!mapView) {
            mapView = buildMapView();
            const main = document.getElementById("auth-welcome");
            const nav = document.getElementById("bottom-nav");
            main?.insertBefore(mapView, nav);
          }
          mapView.classList.remove("hidden");
          renderMapPins();
          renderMapPlaceStrip();
        } else if (mapView) {
          mapView.classList.add("hidden");
        }
      });
    });
  }

  function buildMapView() {
    const section = document.createElement("section");
    section.id = "explorar-map-view";
    section.className = "content flex flex-col";
    section.innerHTML = `
      <p class="text-sm font-sans text-white/80 mb-3 w-full text-center">Visualização em mapa (simulada)</p>
      <div class="explorar-map__canvas">
        <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/8ce12478cc-f68a75c08b7e0b8e1b77.png" alt="Mapa da região" />
        <div id="explorar-map-pins"></div>
      </div>
      <p class="text-xs text-white/50 mt-3 text-center w-full">Toque em um pin ou no card abaixo</p>
      <div id="explorar-map-places" class="horizontal-scroll horizontal-scroll--bleed pb-2" aria-label="Locais no mapa"></div>`;
    return section;
  }

  function renderMapPlaceStrip() {
    const strip = document.getElementById("explorar-map-places");
    if (!strip) return;

    const places = FicaBemDB.getPlaces().slice(0, 8);
    strip.innerHTML = places
      .map(
        (p) => `
      <button type="button" class="explorar-map-place-chip glass-panel" data-place-id="${p.id}">
        <h4>${p.name}</h4>
        <p>${p.neighborhood || "Próximo"}</p>
      </button>`
      )
      .join("");

    strip.querySelectorAll("[data-place-id]").forEach((chip) => {
      chip.addEventListener("click", () => {
        FicaBemDB.startReviewForPlace(chip.dataset.placeId);
        FicaBemNav.go("detalhe", { place: chip.dataset.placeId });
      });
    });
  }

  function renderMapPins() {
    const pins = document.getElementById("explorar-map-pins");
    if (!pins) return;

    const places = FicaBemDB.getPlaces().slice(0, 5);
    const positions = [
      { top: "25%", left: "30%" },
      { top: "45%", left: "55%" },
      { top: "60%", left: "25%" },
      { top: "35%", left: "70%" },
      { top: "70%", left: "60%" },
    ];

    pins.innerHTML = places
      .map((p, i) => {
        const pos = positions[i] || positions[0];
        return `<button type="button" class="explorar-map__pin" style="top:${pos.top};left:${pos.left}" data-place-id="${p.id}" title="${p.name}">
          <i class="fa-solid fa-shield-halved"></i>
        </button>`;
      })
      .join("");

    pins.querySelectorAll("[data-place-id]").forEach((pin) => {
      pin.addEventListener("click", () => {
        FicaBemDB.startReviewForPlace(pin.dataset.placeId);
        FicaBemNav.go("detalhe", { place: pin.dataset.placeId });
      });
    });
  }

  function bindArticles() {
    document.querySelectorAll("#explorar-content article").forEach((article) => {
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

  function bindBookmarks() {
    document.querySelectorAll("#explorar-content article button").forEach((btn) => {
      if (!btn.querySelector(".fa-bookmark")) return;
      const article = btn.closest("article");
      const placeId = article?.dataset.placeId;
      if (!placeId) return;

      const sync = () => {
        const isFav = FicaBemDB.isFavoritePlace(placeId);
        const icon = btn.querySelector("i");
        if (icon) {
          icon.classList.toggle("fa-solid", isFav);
          icon.classList.toggle("fa-regular", !isFav);
        }
        btn.classList.toggle("bg-brand-300/30", isFav);
      };
      sync();

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!FicaBemDB.getCurrentUser()) {
          FicaBemApp.showToast("Entre na conta para salvar favoritos.");
          return;
        }
        FicaBemDB.toggleFavoritePlace(placeId);
        sync();
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
    bindBookmarks();
  }
})();
