// Espace client : consultation et modification des informations du compte.
(() => {
  const form = document.getElementById("info-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const user = VG.session.user();
  if (!user) return;
  $("account-nav").innerHTML = VGUI.accountNav("info");

  const fields = { lastName: "i-lastname", firstName: "i-firstname", phone: "i-phone", street: "i-street", extra: "i-extra", zip: "i-zip", city: "i-city" };
  const fill = () => {
    Object.entries(fields).forEach(([key, id]) => ($(id).value = user[key] || ""));
    $("i-email").value = user.email;
    $("i-fullname").textContent = VG.fullName(user);
    $("i-created").textContent = `Compte créé le ${VG.formatDate(user.createdAt)}.`;
  };
  fill();

  const messages = {
    "i-lastname": "Saisissez votre nom.", "i-firstname": "Saisissez votre prénom.", "i-phone": "Saisissez votre numéro de GSM.",
    "i-street": "Saisissez votre adresse postale.", "i-zip": "Saisissez un code postal à 5 chiffres.", "i-city": "Saisissez votre ville.",
  };

  form.addEventListener("input", () => ($("info-success").hidden = true));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    for (const [id, message] of Object.entries(messages)) {
      if (!$(id).value.trim() || !$(id).checkValidity()) {
        $(id).setAttribute("aria-invalid", "true");
        $(id).focus();
        return VGUI.showError($("info-error"), message);
      }
    }
    $("info-error").hidden = true;
    Object.entries(fields).forEach(([key, id]) => (user[key] = $(id).value.trim()));
    VG.save();
    fill();
    $("info-success").hidden = false;
    $("info-success").scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
