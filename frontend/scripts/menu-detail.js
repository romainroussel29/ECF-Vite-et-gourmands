// Détail d'un menu : le menu est retrouvé à partir de l'URL (/menu-<slug>)
// puis la page est générée depuis le catalogue (galerie, tarif, plats...).
(() => {
  const content = document.getElementById("md-content");
  if (!content) return;

  const esc = VG.escapeHtml;
  const slug = window.location.pathname.replace(/^\/menu-/, "");
  const menu = VG.menuBySlug(slug);
  const role = VG.session.role();
  const isStaff = role === "employee" || role === "admin";

  // Menu inexistant, ou non publié (visible seulement par l'équipe)
  if (!menu || (!(menu.status === "publie" && menu.visible) && !isStaff)) {
    document.getElementById("md-crumb").textContent = "Menu introuvable";
    content.innerHTML = `
      <h2>Menu introuvable</h2>
      <p class="subtitle-desc">Ce menu n'existe pas ou n'est plus proposé.</p>
      <p><a href="/menus" class="btn-primary">Voir tous nos menus</a></p>`;
    return;
  }

  document.title = `${menu.name} - Vite et gourmands`;
  document.getElementById("md-crumb").textContent = menu.name;

  const dishes = VG.menuDishes(menu);
  const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
  const stockText = `${plural(menu.stock, "commande")} restante${menu.stock > 1 ? "s" : ""}`;
  const price = VG.euro(menu.price).replace(",00", "");
  const per = VG.euro(menu.price / menu.min).replace(",00", "");

  // Galerie
  const [cover] = menu.images;
  const gallery = !cover ? "" : `
    <figure class="detail-main-img">
      <img id="detail-main-img" src="/frontend/images/${esc(cover.file)}" alt="${esc(cover.alt)}">
    </figure>
    ${menu.images.length > 1 ? `
      <div class="detail-thumbs">
        ${menu.images.map((img, i) => `
          <button type="button" class="detail-thumb${i === 0 ? " is-active" : ""}" data-src="/frontend/images/${esc(img.file)}" data-alt="${esc(img.alt)}" aria-label="Afficher : ${esc(img.alt)}">
            <img src="/frontend/images/${esc(img.file)}" alt="">
          </button>`).join("")}
      </div>
      <p class="detail-small">Galerie : ${menu.images.length} images · sélectionner une vignette pour l'agrandir.</p>` : ""}`;

  // Bouton Commander selon le profil et le stock
  let orderBlock;
  if (menu.stock <= 0) {
    orderBlock = `<button type="button" class="btn-primary detail-btn" disabled>Commander</button>
      <p class="detail-small">Ce menu n'est plus disponible à la commande pour le moment.</p>`;
  } else if (isStaff) {
    orderBlock = `<button type="button" class="btn-primary detail-btn" disabled>Commander</button>
      <p class="detail-small">La commande en ligne est réservée aux comptes clients.</p>`;
  } else {
    orderBlock = `<a href="/commande?menu=${esc(menu.slug)}" class="btn-primary detail-btn">Commander</a>`;
  }

  const dishColumn = (cat, title) => {
    const list = dishes.filter((d) => d.category === cat);
    return `
      <div>
        <h3>${title}</h3>
        <ul class="dish-list">
          ${list.map((d) => `
            <li class="dish-card">
              <span class="dish-name">${esc(d.name)}</span>
              <span class="dish-allergens">Allergènes : ${d.allergens.length ? esc(d.allergens.join(" · ")) : "aucun allergène majeur"}</span>
            </li>`).join("") || `<li class="dish-card"><span class="dish-allergens">Aucun plat dans cette catégorie.</span></li>`}
        </ul>
      </div>`;
  };

  content.innerHTML = `
    ${menu.status !== "publie" || !menu.visible ? `<div class="notice"><span class="notice-title">Aperçu équipe</span><p>Ce menu n'est pas visible dans le catalogue public (${VG.MENU_STATUS[menu.status]}).</p></div>` : ""}
    <div class="detail-layout">
      <section class="detail-main">
        <h2>${esc(menu.name)}</h2>
        <div class="tags">
          <span class="tag">Thème : ${esc(menu.theme)}</span>
          <span class="tag">Régime : ${esc(menu.diet)}</span>
          ${menu.otherDiet ? `<span class="tag">${esc(menu.otherDiet)}</span>` : ""}
        </div>
        <p class="detail-desc">${esc(menu.desc)}</p>
        ${gallery}
      </section>

      <aside class="detail-aside">
        <p class="detail-aside-label">Tarif du menu</p>
        <p class="detail-price">${price} TTC</p>
        <p class="detail-price-total">Total pour ${menu.min} personnes</p>
        <p class="detail-aside-text">Minimum : ${menu.min} personnes<br>Soit ${per} TTC / personne.</p>

        <hr class="detail-divider">
        <p class="detail-stock">${stockText}</p>
        <p class="detail-small">Stock exprimé en commandes de ce menu, et non en portions.</p>

        <hr class="detail-divider">
        <p class="detail-aside-text">À prévoir au moins ${menu.delay} jours avant la prestation.</p>
        <a href="/contact" class="btn-secondary detail-btn">Contacter l'équipe</a>

        <div class="detail-conditions-box">
          <h3>Conditions du menu avant commande</h3>
          <p>Minimum : ${menu.min} personnes · ${price} TTC pour ${menu.min} personnes · ${stockText}.</p>
          <p>À prévoir au moins ${menu.delay} jours avant la prestation.</p>
          <p>${esc(menu.storage)}</p>
          <p>Remise de 10 % sur le menu à partir de ${menu.min + 5} personnes.</p>
          <p>Modalités de prestation et conditions d'annulation dans les CGV.</p>
        </div>

        ${orderBlock}

        <div class="detail-path">
          <h3>Parcours de commande</h3>
          <div class="detail-path-step">
            <h4>Pas encore connecté</h4>
            <p>Connectez-vous ou créez un compte : vous revenez ensuite directement à la commande, avec ce menu déjà sélectionné.</p>
          </div>
          <div class="detail-path-step">
            <h4>Connecté</h4>
            <p>Renseignez la prestation, choisissez vos plats et validez votre commande.</p>
          </div>
        </div>
      </aside>
    </div>

    <hr class="detail-section-divider">

    <section class="detail-dishes">
      <h2>Les plats au choix</h2>
      <p>Une entrée, un plat et un dessert à choisir parmi les propositions ci-dessous. Toutes les combinaisons présentées sont incluses dans le tarif du menu.</p>
      <div class="dishes-grid">
        ${dishColumn("entree", "Entrées")}
        ${dishColumn("plat", "Plats")}
        ${dishColumn("dessert", "Desserts")}
      </div>
      <p class="detail-allergen-note">Allergènes indiqués pour chaque plat. En cas d'allergie, contactez l'équipe pour vérifier la composition et les éventuelles traces avant toute demande.</p>
    </section>

    <section class="detail-storage">
      <h2>Conditions et conservation</h2>
      <div class="storage-grid">
        <div>
          <h3>Anticipation</h3>
          <p>Commande au moins ${menu.delay} jours avant la prestation, sous réserve du stock disponible.</p>
        </div>
        <div>
          <h3>Stockage</h3>
          <p>${esc(menu.storage)}</p>
        </div>
        <div>
          <h3>Informations complémentaires</h3>
          <p>${esc(menu.conditions)}</p>
          <a href="/cgv" class="inline-link">Consulter les CGV &rarr;</a>
        </div>
      </div>
    </section>`;

  // Galerie : un clic sur une vignette l'affiche en grand
  const mainImg = document.getElementById("detail-main-img");
  const thumbs = content.querySelectorAll(".detail-thumb");
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.dataset.src;
      mainImg.alt = thumb.dataset.alt;
      thumbs.forEach((t) => t.classList.toggle("is-active", t === thumb));
    });
  });
})();
