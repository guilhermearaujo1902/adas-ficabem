/**
 * Fluxo de avaliação em 7 etapas (compartilhado).
 */

const AvaliacaoFlow = {
  bindNext(nextRoute, onSave) {
    const btn = FicaBemApp.findPrimaryActionButton(["próximo", "continuar"]);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof onSave === "function") onSave();
      FicaBemNav.go(nextRoute);
    });

    const headerNext = document.querySelector(
      '#avaliar-header button[aria-label="Próximo"]'
    );
    if (headerNext && headerNext !== btn) {
      headerNext.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof onSave === "function") onSave();
        FicaBemNav.go(nextRoute);
      });
    }
  },

  bindSkip(fromStep) {
    const btn =
      document.querySelector('#avaliar-header button[aria-label="Pular"]') ||
      FicaBemApp.findButton(["pular"]);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const draft = FicaBemDB.getDraftReview();
      const skipped = draft.skippedSteps || [];
      if (!skipped.includes(fromStep)) skipped.push(fromStep);
      FicaBemDB.updateDraftReview({ skippedSteps: skipped });
      FicaBemNav.go("avaliacao7");
    });
  },

  bindCancel() {
    const btn = document.querySelector(
      '#avaliar-header button[aria-label="Cancelar"], #avaliar-header button[aria-label="Voltar"]'
    );
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Deseja sair da avaliação? O rascunho será mantido.")) {
        FicaBemNav.go("explorar");
      }
    });
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
    const active = document.querySelectorAll(".sentiment-chip.active, .sentiment-chip.border-brand-300");
    if (active.length) {
      return Array.from(active).map((el) => el.textContent.trim());
    }
    return Array.from(document.querySelectorAll(".sentiment-chip"))
      .filter((el) => el.classList.contains("active"))
      .map((el) => el.textContent.trim());
  },

  collectChipSelections(selector) {
    return Array.from(document.querySelectorAll(selector))
      .filter((el) => el.classList.contains("active") || el.classList.contains("border-brand-300"))
      .map((el) => el.textContent.trim());
  },

  collectVisibility() {
    let visibility = "public";
    document.querySelectorAll('input[type="radio"], button, [data-visibility]').forEach((el) => {
      const t = (
        el.dataset.visibility ||
        el.value ||
        el.textContent ||
        ""
      ).toLowerCase();
      if ((el.checked || el.classList.contains("ring-2") || el.classList.contains("active")) && t.includes("anôn")) {
        visibility = "anonymous";
      }
    });
    return visibility;
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

  findButton(labels) {
    return FicaBemApp.findButton(labels);
  },
};

if (typeof window !== "undefined") {
  window.AvaliacaoFlow = AvaliacaoFlow;
}
