/**
 * criar-perfil.html — Criar conta → feed (consome convite)
 */
(function initCriarPerfilPage() {
  document.addEventListener("DOMContentLoaded", () => {
    bindBack();
    bindInterestPills();
    bindForm();
  });

  function bindBack() {
    document
      .querySelector("#step-header button")
      ?.addEventListener("click", () => FicaBemNav.go("convite"));
  }

  function bindInterestPills() {
    document.querySelectorAll(".interest-pill input[type='checkbox']").forEach((input) => {
      input.addEventListener("change", () => {
        const checked = document.querySelectorAll(
          ".interest-pill input[type='checkbox']:checked"
        );
        if (checked.length > 3) {
          input.checked = false;
          FicaBemApp.showToast("Selecione até 3 áreas de interesse.");
        }
      });
    });
  }

  function bindForm() {
    const form = document.getElementById("create-account-form");
    const btn = FicaBemApp.findButton(["criar conta"]);

    const submit = (e) => {
      e?.preventDefault();
      handleCreateAccount();
    };

    form?.addEventListener("submit", submit);
    btn?.addEventListener("click", submit);
  }

  function handleCreateAccount() {
    const name = document.getElementById("name")?.value?.trim();
    const username = document.getElementById("username")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!name || !username || !password) {
      alert("Preencha nome, usuário e senha.");
      return;
    }

    if (password.length < 8) {
      alert("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    const email = `${username.replace(/^@/, "")}@ficabem.app`;

    if (FicaBemDB.findUserByEmail(email)) {
      alert("Este usuário já está cadastrado.");
      return;
    }

    const interests = Array.from(
      document.querySelectorAll(".interest-pill input:checked")
    ).map((i) => i.value);

    FicaBemDB.createUser({ name, username, email, password, interests });

    const inviteCode = FicaBemDB.getPendingInviteCode();
    if (inviteCode) {
      FicaBemDB.consumeInvite(inviteCode);
      FicaBemDB.clearPendingInviteCode();
    }

    const modal = document.getElementById("success-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("active");
      setTimeout(() => FicaBemNav.go("feed"), 1200);
    } else {
      FicaBemNav.go("feed");
    }
  }
})();
