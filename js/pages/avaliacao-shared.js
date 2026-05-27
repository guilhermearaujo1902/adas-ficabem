/**
 * Fluxo de avaliação em 7 etapas (compartilhado).
 */

const AvaliacaoFlow = {
  STEP_ROUTES: {
    1: "avaliacao2",
    2: "avaliacao3",
    3: "avaliacao4",
    4: "avaliacao5",
    5: "avaliacao6",
    6: "avaliacao7",
  },

  PREV_ROUTES: {
    2: "avaliacao1",
    3: "avaliacao2",
    4: "avaliacao3",
    5: "avaliacao4",
    6: "avaliacao5",
    7: "avaliacao6",
  },

  bindNext(nextRoute, onSave) {
    const btn = FicaBemApp.findPrimaryActionButton(["próximo", "continuar", "publicar"]);
    if (!btn) return;

    const handler = (e) => {
      e.preventDefault();
      if (typeof onSave === "function") onSave();
      FicaBemNav.go(nextRoute);
    };

    btn.addEventListener("click", handler);

    const headerNext = document.querySelector(
      '#avaliar-header button[aria-label="Próximo"]'
    );
    if (headerNext && headerNext !== btn) {
      headerNext.addEventListener("click", handler);
    }
  },

  bindSkip(fromStep) {
    const btn =
      document.querySelector('#avaliar-header button[aria-label="Pular"]') ||
      FicaBemApp.findButton(["pular"]);
    if (!btn) return;

    const nextRoute = this.STEP_ROUTES[fromStep] || "avaliacao7";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const draft = FicaBemDB.getDraftReview();
      const skipped = draft.skippedSteps || [];
      if (!skipped.includes(fromStep)) skipped.push(fromStep);
      FicaBemDB.updateDraftReview({ skippedSteps: skipped });
      FicaBemNav.go(nextRoute);
    });
  },

  bindBack(fromStep) {
    const btn = document.querySelector(
      '#avaliar-header button[aria-label="Voltar"], #avaliar-header button[aria-label="Cancelar"]'
    );
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const draft = FicaBemDB.getDraftReview();

      if (fromStep === 2 && draft.entrySource === "detalhe" && draft.placeId) {
        FicaBemNav.go("detalhe", { place: draft.placeId });
        return;
      }

      if (fromStep === 1) {
        if (confirm("Deseja sair da avaliação? O rascunho será mantido.")) {
          if (draft.entrySource === "detalhe" && draft.placeId) {
            FicaBemNav.go("detalhe", { place: draft.placeId });
          } else {
            FicaBemNav.go("explorar");
          }
        }
        return;
      }

      const prev = this.PREV_ROUTES[fromStep];
      if (prev) FicaBemNav.go(prev);
      else FicaBemNav.go("explorar");
    });
  },

  bindCancel() {
    this.bindBack(1);
  },

  collectFormData() {
    const data = {};
    document.querySelectorAll("input, textarea, select").forEach((el, i) => {
      const key = el.name || el.id || `field_${i}`;
      if (el.type === "checkbox") data[key] = el.checked;
      else if (el.type === "radio") {
        if (el.checked) data[key] = el.value;
      } else if (el.type !== "file") data[key] = el.value;
    });
    return data;
  },

  collectSentiments() {
    return Array.from(
      document.querySelectorAll(".sentiment-chip.active, .sentiment-chip.border-brand-300")
    ).map((el) => el.textContent.trim());
  },

  collectChipSelections(selector) {
    return Array.from(document.querySelectorAll(selector))
      .filter((el) => el.checked)
      .map((el) => {
        const label = el.closest("label");
        return label?.querySelector("div")?.textContent?.trim() || el.value;
      });
  },

  collectVisibility() {
    const checked = document.querySelector('input[name="visibility"]:checked');
    if (checked?.value === "anonymous") return "anonymous";
    return "public";
  },

  collectRangeRatings() {
    const ratings = {};
    document.querySelectorAll(".glass-panel").forEach((panel) => {
      const range = panel.querySelector('input[type="range"]');
      const title = panel.querySelector("h2")?.textContent?.trim();
      if (range && title) {
        ratings[title] = Number(range.value);
      }
    });
    return ratings;
  },

  bindListRowSelection() {
    document.querySelectorAll(".list-row").forEach((row) => {
      row.addEventListener("click", () => {
        document.querySelectorAll(".list-row").forEach((r) => {
          r.classList.remove("ring-2", "ring-brand-300");
        });
        row.classList.add("ring-2", "ring-brand-300");
        const name = row.querySelector(".font-semibold, .font-medium")?.textContent?.trim();
        if (name) {
          const place = FicaBemDB.ensurePlace({ name });
          FicaBemDB.updateDraftReview({ placeId: place.id, placeName: place.name });
        }
      });
    });
  },

  bindRangeSliders() {
    document.querySelectorAll('input[type="range"]').forEach((input) => {
      const panel = input.closest(".glass-panel");
      if (!panel) return;

      let fill = panel.querySelector(".range-fill");
      if (!fill) {
        const wrap = input.parentElement;
        if (wrap) {
          fill = wrap.querySelector(".absolute.bg-brand-300, .absolute[class*='bg-brand-300']");
          if (fill) fill.classList.add("range-fill");
        }
      }

      const percentLabel = panel.querySelector(".text-brand-300.font-bold, span.text-brand-300");

      const sync = () => {
        const val = Number(input.value);
        if (fill) fill.style.width = `${val}%`;
        if (percentLabel && percentLabel.textContent.includes("%")) {
          percentLabel.textContent = `${val}%`;
        }
        input.dataset.value = String(val);
      };

      input.addEventListener("input", sync);
      input.addEventListener("change", sync);
      sync();
    });
  },

  bindStarRating() {
    const container = document.querySelector(".star-rating");
    if (!container) return;

    const stars = Array.from(container.querySelectorAll(".fa-star"));
    const label = container.parentElement?.querySelector(".rounded-full span");

    const labels = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

    const setRating = (n) => {
      stars.forEach((star, i) => {
        star.classList.toggle("text-brand-300", i < n);
        star.classList.toggle("text-white/20", i >= n);
        star.classList.remove("fa-regular");
        star.classList.add("fa-solid");
      });
      if (label) label.textContent = labels[n] || "Bom";
      container.dataset.rating = String(n);
    };

    stars.forEach((star, index) => {
      star.style.cursor = "pointer";
      star.addEventListener("click", (e) => {
        e.preventDefault();
        setRating(index + 1);
      });
    });

    const initial = stars.filter((s) => s.classList.contains("text-brand-300")).length;
    if (initial) setRating(initial);
  },

  bindPhotoStep() {
    const consent = document.querySelector("#avaliar-content input.checkbox-custom, #avaliar-content input[type='checkbox']");
    if (consent && !consent.checked) {
      consent.checked = true;
      consent.dispatchEvent(new Event("change", { bubbles: true }));
    }

    let fileInput = document.getElementById("photo-file-input");
    const uploadBtn = document.querySelector(".dashed-upload, button .fa-camera")?.closest("button") ||
      document.querySelector(".dashed-upload");

    if (!fileInput && uploadBtn) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "photo-file-input";
      fileInput.accept = "image/*";
      fileInput.multiple = true;
      fileInput.className = "sr-only";
      uploadBtn.parentElement?.appendChild(fileInput);
    }

    uploadBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput?.click();
    });

    const grid = document.querySelector("#avaliar-content .grid.grid-cols-2");
    let coverIndex = 0;

    const refreshGrid = () => {
      if (!grid) return;
      const photos = JSON.parse(grid.dataset.photos || "[]");
      const countLabel = document.querySelector("#avaliar-content h3");
      if (countLabel) countLabel.textContent = `Fotos adicionadas (${photos.length})`;

      if (!photos.length) {
        grid.innerHTML =
          '<p class="col-span-2 text-sm text-white/50 text-center py-4">Nenhuma foto ainda. Toque em Adicionar foto.</p>';
        return;
      }

      grid.innerHTML = photos
        .map(
          (src, i) => `
        <div class="relative rounded-[16px] overflow-hidden aspect-square border ${i === coverIndex ? "border-2 border-brand-300" : "border-white/10"} soft-shadow group cursor-pointer photo-thumb" data-index="${i}">
          <img class="w-full h-full object-cover" src="${src}" alt="Foto ${i + 1}" />
          ${i === coverIndex ? '<div class="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md"><span class="text-[10px] font-medium text-white">Capa</span></div>' : ""}
          <button type="button" class="photo-remove absolute top-2 left-2 w-6 h-6 bg-black/40 rounded-full flex items-center justify-center text-white/80" data-index="${i}" aria-label="Remover">
            <i class="fa-solid fa-xmark text-[12px]"></i>
          </button>
        </div>`
        )
        .join("");

      grid.querySelectorAll(".photo-thumb").forEach((thumb) => {
        thumb.addEventListener("click", (ev) => {
          if (ev.target.closest(".photo-remove")) return;
          coverIndex = Number(thumb.dataset.index);
          refreshGrid();
        });
      });

      grid.querySelectorAll(".photo-remove").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const idx = Number(btn.dataset.index);
          const photos = JSON.parse(grid.dataset.photos || "[]");
          photos.splice(idx, 1);
          if (coverIndex >= photos.length) coverIndex = 0;
          grid.dataset.photos = JSON.stringify(photos);
          refreshGrid();
        });
      });
    };

    fileInput?.addEventListener("change", () => {
      if (!grid || !fileInput.files?.length) return;
      const existing = JSON.parse(grid.dataset.photos || "[]");
      Array.from(fileInput.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          existing.push(reader.result);
          grid.dataset.photos = JSON.stringify(existing);
          refreshGrid();
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = "";
    });

    const draft = FicaBemDB.getDraftReview();
    if (draft.step5?.photos?.length && grid) {
      grid.dataset.photos = JSON.stringify(draft.step5.photoData || []);
      coverIndex = draft.step5.coverIndex || 0;
      refreshGrid();
    } else if (grid && !grid.dataset.photos) {
      const imgs = Array.from(grid.querySelectorAll("img")).map((img) => img.src);
      if (imgs.length) {
        grid.dataset.photos = JSON.stringify(imgs);
        refreshGrid();
      }
    }

    return {
      getPhotoData() {
        if (!grid) return { photos: [], coverIndex: 0 };
        const photos = JSON.parse(grid.dataset.photos || "[]");
        return {
          photos: photos.map((_, i) => `foto-${i + 1}.jpg`),
          photoData: photos,
          coverIndex,
        };
      },
    };
  },

  bindTagAndProfileChecks() {
    document.querySelectorAll(".tag-checkbox").forEach((input) => {
      input.addEventListener("change", () => {
        /* estilos via :checked + div no CSS */
      });
    });

    document.querySelectorAll('input[name="recommend"]').forEach((input) => {
      input.addEventListener("change", () => {
        document.querySelectorAll('input[name="recommend"]').forEach((r) => {
          const box = r.nextElementSibling;
          if (box) {
            box.classList.toggle("ring-2", r.checked);
            box.classList.toggle("ring-brand-300", r.checked);
          }
        });
      });
    });
  },

  updatePlaceNameInTitles() {
    const draft = FicaBemDB.getDraftReview();
    if (!draft.placeName) return;
    document.querySelectorAll("#avaliar-content span.font-medium.text-white").forEach((el) => {
      if (el.textContent.includes("Bar") || el.textContent.length < 40) {
        el.textContent = draft.placeName;
      }
    });
  },

  findButton(labels) {
    return FicaBemApp.findButton(labels);
  },
};

if (typeof window !== "undefined") {
  window.AvaliacaoFlow = AvaliacaoFlow;
}
