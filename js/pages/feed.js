/**
 * Tela: Feed principal (feed.html)
 * Funcionalidades (roteiro):
 * - Filtrar locais por categoria (chips)
 * - CTA "Rota Segura" → rota.html
 * - Exibir avaliações e alertas do localStorage
 */

(function initFeedPage() {
  const CATEGORY_MAP = {
    Cafés: "cafes",
    cafés: "cafes",
    Bares: "bares",
    Transporte: "transporte",
    Restaurantes: "restaurantes",
  };

  document.addEventListener("DOMContentLoaded", () => {
    personalizeHeader();
    bindCategoryFilters();
    bindRotaCta();
    renderFeedData();
  });

  /**
   * Exibe nome da usuária logada no cabeçalho.
   */
  function personalizeHeader() {
    const user = FicaBemDB.getCurrentUser();
    const greeting = document.querySelector("#header-search-filters p, header p");
    if (user && greeting) {
      greeting.textContent = `Bom dia, ${user.name.split(" ")[0]}`;
    }
  }

  /**
   * Ativa filtro ao clicar nos chips de categoria.
   */
  function bindCategoryFilters() {
    const chips = document.querySelectorAll(
      "#header-search-filters button, #header-search-filters .chip"
    );
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("chip--active", "bg-white", "text-brand-dark"));
        chip.classList.add("chip--active");
        const label = chip.textContent.trim();
        const category = CATEGORY_MAP[label] || null;
        renderPlaces(category);
      });
    });
  }

  /**
   * Navega para tela de rota ao clicar no card/botão de rota segura.
   */
  function bindRotaCta() {
    const rotaSection = document.getElementById("quick-actions-cta");
    if (!rotaSection) return;
    rotaSection.addEventListener("click", () => FicaBemNav.go("rota"));
  }

  /**
   * Carrega alertas, locais e atividades do banco simulado.
   */
  function renderFeedData() {
    renderPlaces(null);
    renderReviewsInFeed();
  }

  /**
   * Renderiza cards de locais em alta conforme filtro.
   * @param {string|null} category - Categoria ou null para todos
   */
  function renderPlaces(category) {
    const container = document.querySelector("#trending-safe-spots .flex.flex-col");
    if (!container) return;

    const places = FicaBemDB.getPlaces(category);
    container.innerHTML = places
      .map(
        (p) => `
      <div class="place-card" data-place-id="${p.id}">
        <div class="w-16 h-16 rounded-xl bg-white/10 overflow-hidden shrink-0">
          <img class="w-full h-full object-cover" src="${p.image || ""}" alt="${p.name}" />
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h3 class="font-serif text-base font-semibold">${p.name}</h3>
            <div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
              <i class="fa-solid fa-shield-halved text-brand-accent text-[10px]"></i>
              <span class="font-sans text-xs font-bold">${p.rating}</span>
            </div>
          </div>
          <p class="font-sans text-xs text-white/60 mt-1">${p.neighborhood} • ${p.category}</p>
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".place-card").forEach((card) => {
      card.addEventListener("click", () => {
        FicaBemNav.go("detalhe", { place: card.dataset.placeId });
      });
    });
  }

  /**
   * Injeta avaliações publicadas na seção de atividade das amigas.
   */
  function renderReviewsInFeed() {
    const section = document.getElementById("friends-activity-feed");
    if (!section) return;

    const reviews = FicaBemDB.getReviews().slice(0, 5);
    if (!reviews.length) return;

    const list = section.querySelector(".flex.flex-col.gap-6");
    if (!list) return;

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
          </div>
        </div>
      </div>`
      )
      .join("");

    list.insertAdjacentHTML("afterbegin", html);
  }
})();
