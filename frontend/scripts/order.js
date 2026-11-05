// Espace de commande : à la validation, affiche le bloc de confirmation.
// Le navigateur vérifie d'abord les champs obligatoires (dont le choix des plats).
// L'enregistrement de la commande sera pris en charge par le back-end.
(() => {
  const form = document.getElementById("order-form");
  if (!form) return;

  const submitBtn = document.getElementById("order-submit");
  const confirmation = document.getElementById("order-confirmation");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitBtn.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
    confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
