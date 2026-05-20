/**
 * perfil.html — Dados, estatísticas, Convidar Amigas
 */
(function initPerfilPage() {
  document.addEventListener("DOMContentLoaded", () => {
    renderProfile();
    bindConvidar();
  });

  function renderProfile() {
    const user = FicaBemDB.getCurrentUser();
    if (!user) return;

    const h2 = document.querySelector("#profile-header h2");
    if (h2) h2.textContent = user.name;

    const sub = document.querySelector("#profile-header p.text-white\\/70");
    if (sub) {
      sub.textContent = user.username
        ? `@${user.username.replace(/^@/, "")} • Exploradora`
        : "Exploradora Urbana";
    }

    const stats = document.querySelectorAll("#contribution-stats .font-serif.text-2xl");
    if (stats[0]) stats[0].textContent = user.reviewsCount || 0;
    if (stats[1]) stats[1].textContent = user.routesCount || 0;
    if (stats[2]) stats[2].textContent = user.savedCount || 0;

    const hours = document.querySelector(
      "#security-preferences .fa-clock"
    )?.closest(".flex")?.querySelector("p.text-\\[10px\\]");
    if (hours && user.safeHours?.length) {
      hours.textContent = user.safeHours.join(" • ");
    }

    const cats = document.querySelector(
      "#security-preferences .fa-layer-group"
    )?.closest(".flex")?.querySelector("p.text-\\[10px\\]");
    if (cats && user.avoidedCategories?.length) {
      cats.textContent = user.avoidedCategories.join(", ");
    }
  }

  function bindConvidar() {
    document
      .querySelector("#action-menu .fa-user-plus")
      ?.closest("button")
      ?.addEventListener("click", () => FicaBemNav.go("convite"));
  }
})();
