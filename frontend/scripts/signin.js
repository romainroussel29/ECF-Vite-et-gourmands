// Connexion : vérifie l'identifiant et le mot de passe, ouvre la session
// puis redirige vers la page demandée ou vers l'espace du rôle.
(() => {
  const form = document.getElementById("signin-form");
  if (!form) return;

  const error = document.getElementById("signin-error");
  const email = document.getElementById("email-input");
  const password = document.getElementById("password-input");

  // Déjà connecté : direction l'espace personnel
  const role = VG.session.role();
  if (role !== "visitor") {
    navigateTo(VG.param("redirect") || VG.session.homeFor(role));
    return;
  }

  const showError = (message, field) => {
    error.textContent = message;
    error.hidden = false;
    field.focus();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!email.value.trim() || !email.checkValidity()) return showError("Saisissez une adresse mail valide.", email);
    if (!password.value) return showError("Saisissez votre mot de passe.", password);

    const result = VG.session.login(email.value.trim(), password.value);
    if (!result.ok) return showError(result.error, password);

    const redirect = VG.param("redirect");
    // On ne suit que les redirections internes
    navigateTo(redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : VG.session.homeFor(result.account.role));
  });

  // Conserve la redirection vers la page demandée si on passe par l'inscription
  const signupLink = document.querySelector('a[href="/signup"]');
  const redirect = VG.param("redirect");
  if (signupLink && redirect) signupLink.setAttribute("href", `/signup?redirect=${encodeURIComponent(redirect)}`);
})();
