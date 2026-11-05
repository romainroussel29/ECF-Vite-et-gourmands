// Nouveau mot de passe : règles vérifiées pendant la saisie, puis confirmation.
// L'enregistrement du mot de passe sera pris en charge par le back-end.
(() => {
  const form = document.getElementById("reset-form");
  if (!form) return;

  const password = document.getElementById("reset-password");
  const confirm = document.getElementById("reset-confirm");
  const error = document.getElementById("reset-error");

  const rules = {
    length: (v) => v.length >= 10,
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    digit: (v) => /\d/.test(v),
    special: (v) => /[^A-Za-z0-9]/.test(v),
  };

  const checkRules = () => {
    let allValid = true;
    document.querySelectorAll("#reset-rules li").forEach((li) => {
      const valid = rules[li.dataset.rule](password.value);
      li.classList.toggle("is-valid", valid);
      if (!valid) allValid = false;
    });
    return allValid;
  };

  const showError = (message, field) => {
    error.textContent = message;
    error.hidden = false;
    field.focus();
  };

  password.addEventListener("input", () => {
    checkRules();
    error.hidden = true;
  });
  confirm.addEventListener("input", () => (error.hidden = true));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkRules()) {
      return showError("Le mot de passe ne respecte pas toutes les règles ci-dessus.", password);
    }
    if (password.value !== confirm.value) {
      return showError("Les deux mots de passe ne sont pas identiques.", confirm);
    }
    document.getElementById("reset-request").hidden = true;
    document.getElementById("reset-confirmation").hidden = false;
  });
})();
