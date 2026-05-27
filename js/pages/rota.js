/**
 * rota.html — Mapa, compartilhamento, overlay de rota
 */
(function initRotaPage() {
  const SHARED_CONTACTS = [
    { id: "c1", name: "Ana Paula", role: "Contato Frequente", avatar: "avatar-5.jpg" },
    { id: "c2", name: "Juliana", role: "Irmã", avatar: "avatar-6.jpg" },
    { id: "c3", name: "Beatriz", role: "Amiga", avatar: "avatar-2.jpg" },
  ];

  let activeShareIds = new Set(["c1"]);

  document.addEventListener("DOMContentLoaded", () => {
    const placeId = FicaBemNav.getQueryParam("place");
    if (placeId) highlightDestination(placeId);

    renderAlertsInSheet();
    renderTrendingPlaces();
    renderRecentReviews();
    bindBack();
    bindHeaderActions();
    bindShareFlow();
    bindMapOverlay();
    bindFinishRoute();
    bindRouteToggle();
    renderSharedContacts();
  });

  function bindBack() {
    document
      .querySelector("#rota-header button[aria-label='Voltar']")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        const overlay = document.getElementById("rota-map-overlay");
        if (overlay?.classList.contains("is-visible")) {
          closeMapOverlay();
          return;
        }
        FicaBemNav.go("feed");
      });
  }

  function bindHeaderActions() {
    const optionsBtn = document.querySelector("#rota-header button[aria-label='Opções']");
    if (optionsBtn) optionsBtn.style.display = "none";

    const endBtn = document.getElementById("rota-header-end");
    endBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Deseja encerrar o compartilhamento desta rota?")) {
        FicaBemApp.showToast("Rota encerrada.");
        FicaBemNav.go("feed");
      }
    });

    document.querySelector(".map-container")?.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      openMapOverlay();
    });
  }

  function bindMapOverlay() {
    let overlay = document.getElementById("rota-map-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "rota-map-overlay";
      overlay.innerHTML = `
        <header class="rota-map-overlay__header">
          <button type="button" class="w-10 h-10 rounded-full glass-panel flex items-center justify-center" id="rota-map-back" aria-label="Voltar">
            <i class="fa-solid fa-chevron-left text-white"></i>
          </button>
          <span class="text-sm font-semibold text-white">Rota no mapa</span>
          <button type="button" class="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold px-2" id="rota-map-end" aria-label="Encerrar rota">Encerrar</button>
        </header>
        <div class="rota-map-overlay__body map-container">
          <div class="absolute inset-0 bg-[#1a3c33] mix-blend-multiply opacity-60 z-10 pointer-events-none"></div>
          <img class="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/8ce12478cc-f68a75c08b7e0b8e1b77.png" alt="Mapa com rota" />
          <svg class="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 375 840" preserveAspectRatio="none">
            <path d="M 180 600 C 180 500, 220 450, 200 350 C 180 250, 150 200, 150 100" fill="none" stroke="#86efac" stroke-width="6" stroke-linecap="round" />
            <circle cx="180" cy="600" r="8" fill="#ffffff" stroke="#2f6759" stroke-width="4" />
            <circle cx="150" cy="100" r="10" fill="#86efac" stroke="#ffffff" stroke-width="3" />
          </svg>
        </div>`;
      document.querySelector(".rota-content")?.appendChild(overlay);
    }

    document.getElementById("rota-map-back")?.addEventListener("click", (e) => {
      e.preventDefault();
      closeMapOverlay();
    });

    document.getElementById("rota-map-end")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Encerrar rota?")) {
        closeMapOverlay();
        FicaBemNav.go("feed");
      }
    });
  }

  function openMapOverlay() {
    document.getElementById("rota-map-overlay")?.classList.add("is-visible");
  }

  function closeMapOverlay() {
    document.getElementById("rota-map-overlay")?.classList.remove("is-visible");
  }

  function bindFinishRoute() {
    document
      .querySelector("#route-bottom-sheet button.w-full.bg-white\\/10")
      ?.addEventListener("click", () => {
        if (confirm("Encerrar rota?")) FicaBemNav.go("feed");
      });
  }

  function bindRouteToggle() {
    document.querySelectorAll(".route-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", function onToggle() {
        const slider = this.parentElement?.querySelector(".route-toggle-slider");
        const siblings = this.parentElement?.querySelectorAll(".route-toggle-btn");
        siblings?.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        if (slider) {
          slider.style.transform = (this.textContent || "").toLowerCase().includes("rápida")
            ? "translateX(100%)"
            : "translateX(0)";
        }
      });
    });
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

  function renderSharedContacts() {
    const row = document.querySelector(
      "#route-bottom-sheet .flex.gap-3.overflow-x-auto"
    );
    if (!row) return;

    const staticHtml = row.innerHTML;
    const addBtn = row.querySelector("[onclick*='share-modal']");
    if (addBtn) addBtn.removeAttribute("onclick");

    row.querySelectorAll("[onclick]").forEach((el) => el.removeAttribute("onclick"));
  }

  function bindShareFlow() {
    const modal = document.getElementById("share-modal");
    const addLinks = [
      document.getElementById("btn-rota-adicionar-contato"),
      document.getElementById("btn-rota-adicionar-link"),
      ...document.querySelectorAll("#route-bottom-sheet button.text-brand-300"),
    ].filter(Boolean);

    addLinks.forEach((el) => {
      el.removeAttribute("onclick");
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openShareModal();
      });
    });

    modal?.querySelectorAll(".modal-content .space-y-4 > div").forEach((row, i) => {
      const contact = SHARED_CONTACTS[i];
      if (!contact) return;
      const plusBtn = row.querySelector("button");
      plusBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        if (activeShareIds.has(contact.id)) {
          activeShareIds.delete(contact.id);
          plusBtn.innerHTML = '<i class="fa-solid fa-plus text-[14px]"></i>';
          FicaBemApp.showToast(`${contact.name} removida do compartilhamento.`);
        } else {
          activeShareIds.add(contact.id);
          plusBtn.innerHTML = '<i class="fa-solid fa-check text-[14px]"></i>';
          FicaBemApp.showToast(`${contact.name} adicionada ao compartilhamento.`);
        }
      });
    });

    modal?.querySelectorAll("button").forEach((btn) => {
      const t = (btn.textContent || "").toLowerCase();
      if (t.includes("cancelar")) {
        btn.removeAttribute("onclick");
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          closeShareModal();
        });
      }
      if (t.includes("copiar")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          FicaBemApp.showToast("Link da rota copiado!");
        });
      }
      if (t.includes("enviar")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          FicaBemApp.showToast("Convite de rota enviado!");
          closeShareModal();
        });
      }
    });
  }

  function openShareModal() {
    const modal = document.getElementById("share-modal");
    modal?.classList.add("active");
  }

  function closeShareModal() {
    const modal = document.getElementById("share-modal");
    modal?.classList.remove("active");
  }
})();
