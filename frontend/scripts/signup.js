// Inscription : vérifie les champs et les règles du mot de passe,
// crée un compte client puis ouvre la session.
(() => {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const error = $("signup-error");
  const password = $("pwd-signup");
  const redirect = VG.param("redirect");
  if (redirect) $("signup-login-link").setAttribute("href", `/signin?redirect=${encodeURIComponent(redirect)}`);

  const rules = {
    length: (v) => v.length >= 10,
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    digit: (v) => /\d/.test(v),
    special: (v) => /[^A-Za-z0-9]/.test(v),
  };
  const checkRules = () => {
    let ok = true;
    document.querySelectorAll("#signup-rules li").forEach((li) => {
      const valid = rules[li.dataset.rule](password.value);
      li.classList.toggle("is-valid", valid);
      if (!valid) ok = false;
    });
    return ok;
  };
  password.addEventListener("input", checkRules);

  const fields = [
    ["su-lastname", "Saisissez votre nom."],
    ["su-firstname", "Saisissez votre prénom."],
    ["su-phone", "Saisissez votre numéro de GSM."],
    ["su-email", "Saisissez une adresse mail valide."],
    ["su-street", "Saisissez votre adresse postale."],
    ["su-zip", "Saisissez un code postal à 5 chiffres."],
    ["su-city", "Saisissez votre ville."],
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

    for (const [id, message] of fields) {
      const input = $(id);
      if (!input.value.trim() || !input.checkValidity()) {
        input.setAttribute("aria-invalid", "true");
        error.textContent = message;
        error.hidden = false;
        return input.focus();
      }
    }
    if (!checkRules()) {
      password.setAttribute("aria-invalid", "true");
      error.textContent = "Le mot de passe ne respecte pas toutes les règles.";
      error.hidden = false;
      return password.focus();
    }
    const email = $("su-email").value.trim();
    if (VG.account(email)) {
      $("su-email").setAttribute("aria-invalid", "true");
      error.textContent = "Un compte existe déjà avec cette adresse mail. Connectez-vous ou utilisez une autre adresse.";
      error.hidden = false;
      return $("su-email").focus();
    }

    VG.data.accounts.push({
      firstName: $("su-firstname").value.trim(), lastName: $("su-lastname").value.trim(),
      email, phone: $("su-phone").value.trim(), street: $("su-street").value.trim(),
      extra: $("su-extra").value.trim(), zip: $("su-zip").value.trim(), city: $("su-city").value.trim(),
      password: password.value, role: "client", active: true, createdAt: new Date().toISOString(),
    });
    VG.save();
    VG.session.login(email, password.value);
    navigateTo(redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account");
  });
})();
