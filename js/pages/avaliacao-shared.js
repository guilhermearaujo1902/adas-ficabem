/**
 * Funções compartilhadas pelo fluxo de avaliação (7 etapas).
 * Usado pelos scripts avaliacao-1.js … avaliacao-7.js
 */

const AvaliacaoFlow = {
  /**
   * Vincula botão "Próximo" ou "Continuar" à próxima etapa.
   * @param {string} nextRoute - Nome da rota em FicaBemNav
   * @param {Function} [onSave] - Callback para salvar dados antes de navegar
   */
  bindNext(nextRoute, onSave) {
    const btn = this.findButton(["Próximo", "Continuar", "proximo"]);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof onSave === "function") onSave();
      FicaBemNav.go(nextRoute);
    });
  },

  /**
   * Vincula botão "Pular" direto para revisão final (etapa 7).
   * @param {number} fromStep - Número da etapa atual (1-6)
   */
  bindSkip(fromStep) {
    const btn = this.findButton(["Pular", "pular"]);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const draft = FicaBemDB.getDraftReview();
      draft.skippedSteps = draft.skippedSteps || [];
      if (!draft.skippedSteps.includes(fromStep)) draft.skippedSteps.push(fromStep);
      FicaBemDB.updateDraftReview({ skippedSteps: draft.skippedSteps });
      FicaBemNav.go("avaliacao7");
    });
  },

  /**
   * Coleta valores de inputs, textareas e selects do formulário visível.
   * @returns {Object} Pares nome/valor simplificados
   */
  collectFormData() {
    const data = {};
    document.querySelectorAll("input, textarea, select").forEach((el, i) => {
      const key = el.name || el.id || `field_${i}`;
      if (el.type === "checkbox") data[key] = el.checked;
      else if (el.type === "radio") {
        if (el.checked) data[key] = el.value;
      } else data[key] = el.value;
    });
    return data;
  },

  /**
   * Localiza botão pelo texto.
   * @param {string[]} labels
   * @returns {HTMLButtonElement|null}
   */
  findButton(labels) {
    return Array.from(document.querySelectorAll("button")).find((btn) =>
      labels.some((l) => (btn.textContent || "").trim().includes(l))
    );
  },
};

if (typeof window !== "undefined") {
  window.AvaliacaoFlow = AvaliacaoFlow;
}
