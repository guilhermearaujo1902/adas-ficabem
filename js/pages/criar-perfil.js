/**
 * criar-perfil.html — Criar conta → feed (consome convite)
 */
(function initCriarPerfilPage() {
  document.addEventListener("DOMContentLoaded", () => {
    bindBack();
    bindInterestPills();
    bindUsernamePrefix();
    bindPasswordToggle();
    bindForm();
    prefillFromCurrentUser();
  });

  function bindBack() {
    document
      .querySelector("#step-header button")
      ?.addEventListener("click", () => FicaBemNav.go("convite"));
  }

  function bindUsernamePrefix() {
    const input = document.getElementById("username");
    if (!input) return;

    input.addEventListener("input", () => {
      input.value = input.value.replace(/^@+/, "").replace(/\s/g, "");
    });

    input.addEventListener("blur", () => {
      if (input.value && !input.value.startsWith("@")) {
        /* prefixo visual via span no HTML; valor sem @ */
      }
    });
  }

  function bindPasswordToggle() {
    const input = document.getElementById("password");
    const btn = input?.parentElement?.querySelector("button[type='button']");
    if (!input || !btn) return;

    btn.setAttribute("aria-label", "Mostrar senha");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show
        ? '<i class="fa-regular fa-eye-slash text-[18px]"></i>'
        : '<i class="fa-regular fa-eye text-[18px]"></i>';
      btn.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
    });

    if (!btn.querySelector(".fa-eye")) {
      btn.innerHTML = '<i class="fa-regular fa-eye text-[18px]"></i>';
    }
  }

  function prefillFromCurrentUser() {
    const user = FicaBemDB.getCurrentUser();
    if (!user) return;
    const name = document.getElementById("name");
    const username = document.getElementById("username");
    if (name && user.name) name.value = user.name;
    if (username && user.username) username.value = user.username.replace(/^@/, "");
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
    const btn = FicaBemApp.findButton(["criar conta", "salvar"]);

    const submit = (e) => {
      e?.preventDefault();
      handleCreateAccount();
    };

    form?.addEventListener("submit", submit);
    btn?.addEventListener("click", submit);
  }

  function handleCreateAccount() {
    const name = document.getElementById("name")?.value?.trim();
    const username = document.getElementById("username")?.value?.trim().replace(/^@/, "");
    const password = document.getElementById("password")?.value;
    const current = FicaBemDB.getCurrentUser();

    if (!name || !username || !password) {
      alert("Preencha nome, usuário e senha.");
      return;
    }

    if (password.length < 8) {
      alert("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    const email = `${username}@ficabem.app`;

    if (current) {
      FicaBemDB.updateUser(current.id, { name, username, password, email });
      FicaBemApp.showToast("Perfil atualizado!");
      setTimeout(() => FicaBemNav.go("perfil"), 600);
      return;
    }

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
