/**
 * Tela: Perfil da usuária (perfil.html)
 * Funcionalidades (roteiro):
 * - Exibir dados cadastrados, contagem de avaliações e salvas
 * - Horários seguros e categorias evitadas
 * - "Convidar Amigas" → convite.html
 */

(function initPerfilPage() {
  document.addEventListener("DOMContentLoaded", () => {
    renderProfile();
    bindConvidarButton();
  });

  /**
   * Preenche a tela com dados do usuário logado.
   */
  function renderProfile() {
    const user = FicaBemDB.getCurrentUser();
    if (!user) return;

    const nameEl = document.querySelector("#profile-header h2, #profile-header h3, section h2");
    if (nameEl) nameEl.textContent = user.name;

    const emailEl = document.querySelector("#profile-header p");
    if (emailEl && user.email) emailEl.textContent = user.email;

    document.querySelectorAll("[data-stat-reviews]").forEach((el) => {
      el.textContent = user.reviewsCount || 0;
    });

    document.querySelectorAll("[data-stat-saved]").forEach((el) => {
      el.textContent = user.savedCount || 0;
    });

    // Atualiza números em cards genéricos (wireframe)
    document.querySelectorAll("span.font-bold, .font-bold").forEach((el) => {
      if ((el.textContent || "").match(/^\d+$/)) {
        const label = el.parentElement?.textContent?.toLowerCase() || "";
        if (label.includes("avalia")) el.textContent = user.reviewsCount || 0;
        if (label.includes("salv")) el.textContent = user.savedCount || 0;
      }
    });
  }

  /**
   * Navega para tela de convite.
   */
  function bindConvidarButton() {
    document.querySelectorAll("button, a").forEach((el) => {
      if ((el.textContent || "").toLowerCase().includes("convidar")) {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          FicaBemNav.go("convite");
        });
      }
    });
  }
})();
