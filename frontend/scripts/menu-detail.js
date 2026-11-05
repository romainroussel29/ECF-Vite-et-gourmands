// Pages de détail d'un menu : galerie d'images et lien « Commander ».
// Script classique rechargé à chaque visite : encapsulé dans une IIFE.
(() => {
  const page = document.querySelector(".menu-detail");
  if (!page) return;

  // 1. Galerie : un clic sur une vignette l'affiche en grand
  const mainImg = document.getElementById("detail-main-img");
  const thumbs = page.querySelectorAll(".detail-thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.dataset.src;
      mainImg.alt = thumb.dataset.alt;
      thumbs.forEach((t) => t.classList.toggle("is-active", t === thumb));
    });
  });

  // 2. Commander : un visiteur non connecté passe d'abord par la connexion
  const orderLink = page.querySelector("[data-order-link]");
  if (orderLink && !localStorage.getItem("userRole")) {
    orderLink.setAttribute("href", "/signin");
  }
})();
