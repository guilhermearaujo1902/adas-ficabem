/**
 * feed.html — Filtros, rota, locais e avaliações
 */
(function initFeedPage() {
  const CATEGORY_LABELS = {
    cafes: "Café",
    bares: "Bar",
    transporte: "Transporte",
    restaurantes: "Restaurante",
    coworking: "Coworking",
    parques: "Parque",
    lojas: "Loja",
  };

  document.addEventListener("DOMContentLoaded", () => {
    personalizeHeader();
    bindCategoryFilters();
    bindRotaCta();
    bindVerMapa();
    renderAlerts();
    FicaBemApp.setSavedFilter(null);
    renderPlaces(null);
    renderReviewsInFeed();
  });

  function personalizeHeader() {
    const user = FicaBemDB.getCurrentUser();
    const greeting = document.querySelector("#header-search-filters p");
    if (user && greeting) {
      greeting.textContent = `Bom dia, ${user.name.split(" ")[0]}`;
    }
  }

  function bindCategoryFilters() {
    const chips = document.querySelectorAll("#feed-filters-scroll button");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => {
          c.classList.remove("bg-white", "text-brand-dark", "font-semibold", "shadow-sm");
          c.classList.add("bg-white/10", "border", "border-white/20", "text-white", "font-medium");
        });
        chip.classList.add("bg-white", "text-brand-dark", "font-semibold", "shadow-sm");
        chip.classList.remove("bg-white/10", "border", "border-white/20", "text-white", "font-medium");

        const category = FicaBemApp.categoryFromLabel(chip.textContent);
        FicaBemApp.setSavedFilter(category);
        renderPlaces(category);
      });
    });
  }

  function bindRotaCta() {
    document.getElementById("quick-actions-cta")?.addEventListener("click", (e) => {
      if (e.target.closest("[data-favorite], [data-rate]")) return;
      FicaBemNav.go("rota");
    });
    document.querySelector("#quick-actions-cta button")?.addEventListener("click", (e) => {
      e.stopPropagation();
      FicaBemNav.go("rota");
    });
  }

  function bindVerMapa() {
    document.querySelectorAll("#trending-safe-spots a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        FicaBemNav.go("explorar");
      });
    });
  }

  function renderAlerts() {
    const row = document.getElementById("alerts-scroll");
    if (!row) return;

    const alerts = FicaBemDB.getAlerts();
    row.innerHTML = alerts
      .map((a) => {
        const isDanger = a.type === "danger";
        const cardClass = isDanger
          ? "bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2"
          : "bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 flex flex-col gap-2";
        const labelClass = isDanger
          ? "flex items-center gap-2 text-red-200"
          : "flex items-center gap-2 text-yellow-200";
        const label = isDanger ? "Atenção" : "Aviso";
        const icon = isDanger ? "triangle-exclamation" : "circle-info";
        return `
        <article class="${cardClass}">
          <div class="${labelClass}">
            <i class="fa-solid fa-${icon} text-xs"></i>
            <span class="font-sans text-xs font-medium">${label}</span>
          </div>
          <p class="font-sans text-sm text-white leading-snug">${a.text}</p>
          <span class="font-sans text-[10px] text-white/50 mt-1">${a.time} • Por ${a.author}</span>
        </article>`;
      })
      .join("");
  }

  function formatCategory(category) {
    return CATEGORY_LABELS[category] || category || "Local";
  }

  function bindPlaceCardActions(card, placeId) {
    const favBtn = card.querySelector("[data-favorite]");
    if (favBtn) {
      const isFav = FicaBemDB.isFavoritePlace(placeId);
      favBtn.classList.toggle("is-favorite", isFav);
      const icon = favBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-solid", isFav);
        icon.classList.toggle("fa-regular", !isFav);
      }
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!FicaBemDB.getCurrentUser()) {
          FicaBemApp.showToast("Entre na conta para salvar favoritos.");
          return;
        }
        const nowFav = FicaBemDB.toggleFavoritePlace(placeId);
        favBtn.classList.toggle("is-favorite", nowFav);
        if (icon) {
          icon.classList.toggle("fa-solid", nowFav);
          icon.classList.toggle("fa-regular", !nowFav);
        }
        FicaBemApp.showToast(nowFav ? "Adicionado aos favoritos" : "Removido dos favoritos");
      });
    }

    const rateBtn = card.querySelector("[data-rate]");
    rateBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      FicaBemDB.startReviewForPlace(placeId);
      FicaBemNav.go("avaliacao2");
    });
  }

  function renderPlaces(category) {
    const container = document.getElementById("trending-places-list");
    if (!container) return;

    container.classList.add("horizontal-scroll", "horizontal-scroll--bleed", "pb-2");
    container.classList.remove("flex-col", "gap-4");

    const places = FicaBemDB.getPlaces(category);

    if (!places.length) {
      container.innerHTML =
        '<p class="font-sans text-sm text-white/60 py-4 w-full">Nenhum local encontrado para este filtro.</p>';
      return;
    }

    container.innerHTML = places
      .map((p) => {
        const tags = (p.tags || [])
          .slice(0, 3)
          .map(
            (t) =>
              `<span class="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/80">${t}</span>`
          )
          .join("");
        const tagsRow = tags
          ? `<div class="flex gap-2 mt-2 flex-wrap">${tags}</div>`
          : "";
        const imgSrc =
          p.image ||
          "https://storage.googleapis.com/uxpilot-auth.appspot.com/01f2bd413b-5de1466befb3b2a2e26f.png";
        const isFav = FicaBemDB.isFavoritePlace(p.id);

        return `
      <article class="place-card w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center cursor-pointer" data-place-id="${p.id}">
        <div class="w-16 h-16 rounded-xl bg-white/10 overflow-hidden shrink-0">
          <img class="w-full h-full object-cover opacity-80" src="${imgSrc}" alt="${p.name}" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-serif text-base font-semibold truncate">${p.name}</h3>
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" class="place-card__fav w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ${isFav ? "is-favorite" : ""}" data-favorite aria-label="Favoritar">
                <i class="${isFav ? "fa-solid" : "fa-regular"} fa-bookmark text-[12px] text-white"></i>
              </button>
              <button type="button" class="w-8 h-8 rounded-full bg-brand-300/20 flex items-center justify-center" data-rate aria-label="Avaliar local">
                <i class="fa-solid fa-star text-[12px] text-brand-300"></i>
              </button>
              <div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
                <i class="fa-solid fa-shield-halved text-brand-accent text-[10px]"></i>
                <span class="font-sans text-xs font-bold">${p.rating}</span>
              </div>
            </div>
          </div>
          <p class="font-sans text-xs text-white/60 mt-1">${p.neighborhood} • ${formatCategory(p.category)}</p>
          ${tagsRow}
        </div>
      </article>`;
      })
      .join("");

    container.querySelectorAll("[data-place-id]").forEach((card) => {
      const placeId = card.dataset.placeId;
      bindPlaceCardActions(card, placeId);
      card.addEventListener("click", () => {
        FicaBemDB.startReviewForPlace(placeId);
        FicaBemNav.go("detalhe", { place: placeId });
      });
    });
  }

  function renderReviewsInFeed() {
    const section = document.getElementById("friends-activity-feed");
    const list = section?.querySelector(".flex.flex-col.gap-6");
    if (!list) return;

    const reviews = FicaBemDB.getReviews().slice(0, 5);
    if (!reviews.length) return;

    const html = reviews
      .map(
        (r) => `
      <div class="flex gap-3">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-user text-white/70"></i>
        </div>
        <div class="flex-1">
          <div class="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
            <p class="font-sans text-sm text-white/90 mb-2">
              <span class="font-semibold">${r.anonymous ? "Anônima" : r.userName}</span>
              avaliou <span class="font-semibold">${r.placeName}</span>
            </p>
            ${r.comment ? `<p class="text-xs text-white/60">${r.comment}</p>` : ""}
          </div>
        </div>
      </div>`
      )
      .join("");

    list.insertAdjacentHTML("afterbegin", html);
  }
})();
