// ==========================================================================
// UI : petits blocs HTML réutilisés par les pages client et équipe
// (badges, prix, suivi de commande, choix des plats...). Objet global VGUI.
// ==========================================================================
(() => {
  const esc = (t) => VG.escapeHtml(t);

  const UI = {
    // Badge de statut de commande
    statusBadge: (status) => `<span class="badge ${status}">${VG.STATUS[status]}</span>`,

    // Liste de prix d'une commande
    priceList: (price, guests, perPerson) => {
      const p = price;
      return `
        <dl class="price-list">
          <div><dt>${guests} convives × ${VG.euro(perPerson)}</dt><dd>${VG.euro(p.base)}</dd></div>
          <div><dt>Remise menu${p.discountRate ? " (10 %)" : " (non applicable)"}</dt><dd>${p.discount ? "−" + VG.euro(p.discount) : VG.euro(0)}</dd></div>
          <div><dt>Sous-total menu</dt><dd>${VG.euro(p.subtotal)}</dd></div>
          <div><dt>Livraison${p.km ? ` · ${p.km} km` : " · Bordeaux"}</dt><dd>${p.deliveryFee ? VG.euro(p.deliveryFee) : "Offerte"}</dd></div>
          <div class="total"><dt>Total TTC</dt><dd>${VG.euro(p.total)}</dd></div>
        </dl>
        <p class="small muted">${p.km ? `Hors Bordeaux : 5 € + ${p.km} km × 0,59 € = ${VG.euro(p.deliveryFee)}.` : "Livraison offerte dans Bordeaux."}
        Remise de 10 % sur le menu (hors livraison) à partir de 5 convives au-delà du minimum.</p>`;
    },

    // Frise de suivi d'une commande
    timeline: (order) => {
      if (order.status === "annulee") {
        return `<ol class="timeline">${order.history.map((h) => `
          <li class="done"><strong>${VG.STATUS[h.status]}</strong><span>${VG.formatDateTime(h.at)}</span></li>`).join("")}</ol>`;
      }
      const reached = VG.STATUS_FLOW.indexOf(order.status);
      return `<ol class="timeline">${VG.STATUS_FLOW.map((s, i) => {
        // L'étape « retour de matériel » n'apparaît que si du matériel est prêté
        if (s === "attente_materiel" && order.material.length === 0) return "";
        const step = VG.statusAt(order, s);
        const done = i <= reached;
        const label = VG.STATUS[s] + (s === order.status ? " · état actuel" : "");
        return `<li class="${done ? "done" : ""}"><strong>${label}</strong><span>${step ? VG.formatDateTime(step.at) : done ? "" : "À venir"}</span></li>`;
      }).join("")}</ol>`;
    },

    // Plats choisis d'une commande
    dishSummary: (dishes) => `
      <dl class="dish-summary">
        ${dishes.map((d) => `
          <dt>${VG.CATEGORY_LABELS[d.category]}</dt>
          <dd>${esc(d.name)}<span>Allergènes : ${d.allergens.length ? esc(d.allergens.join(", ")) : "aucun allergène majeur"}.</span></dd>`).join("")}
      </dl>`,

    // Boutons radio de choix des plats (entrée, plat, dessert)
    dishChoices: (menu, selected = []) => {
      const dishes = VG.menuDishes(menu);
      const groups = [["entree", "Entrée"], ["plat", "Plat"], ["dessert", "Dessert"]];
      return groups.map(([cat, label]) => {
        const list = dishes.filter((d) => d.category === cat);
        return `
          <fieldset class="dish-group">
            <legend>${label} * · une option à choisir</legend>
            ${list.map((d) => `
              <label class="dish-option">
                <input type="radio" name="dish-${cat}" value="${d.id}" ${selected.includes(d.id) ? "checked" : ""} required />
                <span><span class="dish-name">${esc(d.name)}</span><span class="dish-allergens">Allergènes : ${d.allergens.length ? esc(d.allergens.join(", ")) : "aucun allergène majeur"}</span></span>
              </label>`).join("")}
          </fieldset>`;
      }).join("");
    },

    // Plats cochés dans un formulaire
    readDishChoices: (form) => ["entree", "plat", "dessert"]
      .map((cat) => form.querySelector(`input[name="dish-${cat}"]:checked`)?.value)
      .filter(Boolean),

    // Encart « Conditions du menu »
    menuConditions: (menu) => `
      <h3>Conditions du menu</h3>
      <p class="order-conditions-lead">À prévoir au moins ${menu.delay} jours avant la prestation.</p>
      <p>${esc(menu.storage)}</p>
      <p class="order-small">Modalités de prestation et conditions d'annulation consultables dans les CGV.</p>
      <a href="/cgv" class="inline-link">Consulter les CGV et l'annulation &rarr;</a>`,

    // Sous-navigation de l'espace client
    accountNav: (current) => {
      const user = VG.session.user();
      return `
        <p class="account-connected">Connecté · ${esc(user ? VG.fullName(user) : "")}</p>
        <nav class="account-subnav" aria-label="Mon compte">
          <a href="/account" class="${current === "orders" ? "active" : ""}">Mes commandes</a>
          <a href="/account-info" class="${current === "info" ? "active" : ""}">Mes informations</a>
          <a href="/" data-logout>Déconnexion</a>
        </nav>`;
    },

    // Adresse sur plusieurs lignes
    address: (a) => [a.street, a.extra, `${a.zip} ${a.city}`].filter((x) => x && x.trim()).map(esc).join("<br>"),

    // Message d'erreur dans un encart
    showError: (el, message) => {
      el.textContent = message;
      el.hidden = false;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  };

  window.VGUI = UI;
})();
