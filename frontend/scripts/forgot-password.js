// Mot de passe oublié : contrôle de l'adresse puis affichage de la confirmation.
// L'envoi du mail de réinitialisation sera pris en charge par le back-end.
(() => {
  const form = document.getElementById("forgot-form");
  if (!form) return;

  const input = document.getElementById("forgot-email");
  const error = document.getElementById("forgot-email-error");
  const request = document.getElementById("forgot-request");
  const confirmation = document.getElementById("forgot-confirmation");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!input.checkValidity() || !email) {
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }

    error.hidden = true;
    input.removeAttribute("aria-invalid");
    document.getElementById("forgot-sent-email").textContent = email;
    request.hidden = true;
    confirmation.hidden = false;
  });

  document.getElementById("forgot-retry").addEventListener("click", () => {
    confirmation.hidden = true;
    request.hidden = false;
    input.focus();
  });
})();
