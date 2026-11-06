// Formulaire de contact : vérification des champs puis confirmation d'envoi.
// L'envoi du message sera pris en charge par le back-end.
(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const formBlock = document.getElementById("contact-form-block");
  const success = document.getElementById("contact-success");
  const summary = document.getElementById("contact-error-summary");

  // Chaque champ et sa règle de validation
  const fields = [
    { input: document.getElementById("contact-title"), valid: (el) => el.value.trim() !== "" },
    { input: document.getElementById("contact-desc"), valid: (el) => el.value.trim() !== "" },
    { input: document.getElementById("contact-email"), valid: (el) => el.value.trim() !== "" && el.checkValidity() },
  ];

  const setError = (input, hasError) => {
    document.getElementById(`${input.id}-error`).hidden = !hasError;
    if (hasError) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  // L'erreur disparaît dès que le champ est corrigé
  fields.forEach(({ input, valid }) => {
    input.addEventListener("input", () => {
      if (input.hasAttribute("aria-invalid") && valid(input)) setError(input, false);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalid = fields.filter(({ input, valid }) => {
      const isValid = valid(input);
      setError(input, !isValid);
      return !isValid;
    });

    if (invalid.length > 0) {
      summary.hidden = false;
      invalid[0].input.focus();
      return;
    }

    summary.hidden = true;
    document.getElementById("contact-sent-email").textContent = fields[2].input.value.trim();
    formBlock.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.getElementById("contact-new").addEventListener("click", () => {
    form.reset();
    success.hidden = true;
    formBlock.hidden = false;
    fields[0].input.focus();
  });
})();
