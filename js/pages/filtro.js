/**
 * filtro.html — Busca, chips e lista de locais
 */
(function initFiltroPage() {
  const SECTOR_CATEGORIES = ["bares", "restaurantes"];

  const FILTER_META = {
    todos: { label: "Mais Seguros", sortByRating: true },
    aberto: { label: "Abertos Agora", tagMatch: /aberto/i },
    wifi: { label: "Com Wi-Fi", tagMatch: /wi-?fi/i },
    movimentado: { label: "Movimentado", tagMatch: /movimentado/i },
  };

  let activeFilter = "todos";
  let searchQuery = "";

  document.addEventListener("DOMContentLoaded", () => {
    FicaBemApp.syncPlacesFromDom();
    seedSectorPlaces();
    bindBack();
    bindSearch();
    bindChips();
    applyFilters();
  });

  function seedSectorPlaces() {
    const names = [
      { name: "Bar do Centro", category: "bares", tags: ["Iluminado", "Movimentado"], rating: 4.9 },
      { name: "Cantina Bella", category: "restaurantes", tags: ["Segurança", "Wi-Fi"], rating: 4.7 },
      { name: "Pub da Esquina", category: "bares", tags: ["Estacionamento"], rating: 4.5 },
      { name: "Verde Vida", category: "restaurantes", tags: ["Iluminado", "Aberto"], rating: 4.3 },
    ];
    names.forEach((p) => FicaBemDB.ensurePlace(p));
  }

  function getSectorPlaces() {
    return FicaBemDB.getPlaces().filter((p) => SECTOR_CATEGORIES.includes(p.category));
  }

  function bindBack() {
    document
      .querySelector("#setor-header button")
      ?.addEventListener("click", () => FicaBemNav.go("explorar"));
  }

  function bindSearch() {
    const input = document.getElementById("filtro-search");
    input?.addEventListener("input", () => {
      searchQuery = input.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function bindChips() {
    const chips = document.querySelectorAll("#filtro-chips button[data-filter]");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter || "todos";
        chips.forEach((c) => {
          c.classList.remove("bg-white", "text-brand-600", "shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]");
          c.classList.add("glass-panel", "text-white");
        });
        chip.classList.add("bg-white", "text-brand-600", "shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]");
        chip.classList.remove("glass-panel", "text-white");
        applyFilters();
      });
    });
  }

  function applyFilters() {
    let places = getSectorPlaces();
    const meta = FILTER_META[activeFilter] || FILTER_META.todos;

    if (searchQuery) {
      places = places.filter((p) => p.name.toLowerCase().includes(searchQuery));
    }

    if (meta.tagMatch) {
      places = places.filter((p) => {
        const blob = [p.name, p.neighborhood, ...(p.tags || [])].join(" ").toLowerCase();
        return meta.tagMatch.test(blob);
      });
    }

    if (meta.sortByRating) {
      places = [...places].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    renderList(places);
  }

  function renderList(places) {
    const list = document.getElementById("filtro-places-list");
    const countEl = document.getElementById("filtro-count");
    if (!list) return;

    if (countEl) {
      const n = places.length;
      countEl.textContent = `${n} ${n === 1 ? "local encontrado" : "locais encontrados"}`;
    }

    if (!places.length) {
      list.innerHTML =
        '<p class="p-6 text-sm text-white/60 font-sans text-center">Nenhum local corresponde aos filtros.</p>';
      return;
    }

    list.innerHTML = places
      .map((p) => {
        const tags = (p.tags || []).slice(0, 2);
        const tagHtml = tags
          .map(
            (t) =>
              `<span class="text-[9px] px-1.5 py-0.5 bg-brand-500/20 rounded text-brand-100">${t}</span>`
          )
          .join("");
        const catLabel = p.category === "restaurantes" ? "Restaurante" : "Bar";
        return `
        <div class="list-row w-full p-4 flex gap-4 items-center relative cursor-pointer" data-place-id="${p.id}">
          <div class="w-12 h-12 shrink-0 rounded-[12px] overflow-hidden relative bg-brand-500/20 flex items-center justify-center">
            ${
              p.image
                ? `<img class="w-full h-full object-cover" src="${p.image}" alt="" />`
                : '<i class="fa-solid fa-martini-glass-citrus text-xl text-brand-300"></i>'
            }
          </div>
          <div class="flex-1 min-w-0 pr-6">
            <h3 class="text-[15px] font-semibold text-white truncate mb-0.5">${p.name}</h3>
            <p class="text-[12px] text-white/60 truncate mb-1">${catLabel} • ${p.neighborhood || "SP"}</p>
            <div class="flex flex-wrap gap-1">${tagHtml}</div>
          </div>
          <i class="fa-solid fa-chevron-right text-white/30 text-[12px] absolute right-4"></i>
        </div>`;
      })
      .join("");

    FicaBemApp.bindPlaceNavigation(list, "[data-place-id]");
  }
})();
