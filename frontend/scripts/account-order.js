// Espace client : détail d'une commande, adapté à son statut
// (modification / annulation, suivi, dépôt d'un avis).
(() => {
  const content = document.getElementById("ao-content");
  if (!content) return;

  const esc = VG.escapeHtml;
  const user = VG.session.user();
  const order = VG.order(VG.param("id") || "");

  // Une commande n'est visible que par son client
  if (!user || !order || VG.normalize(order.client.email) !== VG.normalize(user.email)) {
    content.innerHTML = `
      <h2>Commande introuvable</h2>
      <p class="subtitle-desc">Cette commande n'existe pas ou n'est pas associée à votre compte.</p>
      <p><a href="/account" class="btn-primary">Retour à mes commandes</a></p>`;
    return;
  }

  const render = () => {
    const menu = VG.menuById(order.menuId);
    const s = order.status;
    const review = order.reviewId ? VG.data.reviews.find((r) => r.id === order.reviewId) : null;
    const accepted = VG.statusAt(order, "acceptee");
    document.title = `Commande ${order.id} - Vite et gourmands`;

    const subtitles = {
      en_attente: "Consultez votre prestation et gérez votre commande avant son acceptation.",
      terminee: "Retrouvez le détail de votre prestation et partagez votre expérience avec Vite & Gourmands.",
      annulee: "Cette commande a été annulée.",
    };

    let banner = "";
    if (s === "en_attente") {
      banner = `<div class="notice"><span class="notice-title">Commande modifiable et annulable</span><p>Aucun membre de l'équipe n'a encore accepté cette commande. Dès qu'elle sera acceptée, la modification et l'annulation ne seront plus disponibles.</p></div>`;
    } else if (s === "annulee") {
      const c = order.history[order.history.length - 1];
      banner = `<div class="notice danger"><span class="notice-title">Commande annulée · ${VG.formatDateTime(c.at)}</span><p>${c.reason ? esc(c.reason) : "Le menu a été remis à disposition."}</p></div>`;
    } else if (s === "terminee") {
      banner = `<div class="notice success"><span class="notice-title">Commande terminée</span><p>Prestation du ${VG.formatDate(order.date)} à ${esc(order.time)}, pour ${order.guests} convives. Elle n'est plus modifiable et reste consultable depuis votre historique.</p></div>`;
    } else if (accepted) {
      banner = `<div class="notice"><span class="notice-title">Acceptée par l'équipe · ${VG.formatDateTime(accepted.at)}</span><p>La modification et l'annulation ne sont plus disponibles. Pour toute question, contactez l'équipe en indiquant le numéro ${order.id}.</p></div>`;
    }

    // Matériel prêté à rendre
    let materialNotice = "";
    if (s === "attente_materiel") {
      const delivered = VG.statusAt(order, "livree") || VG.statusAt(order, "attente_materiel");
      materialNotice = `<div class="notice"><span class="notice-title">Matériel à restituer</span><p>${order.material.map((m) => `${esc(m.name)} : ${m.lent - m.returned} à rendre`).join(" · ")}. Merci de le restituer sous ${VG.MATERIAL_DAYS} jours ouvrés après la livraison (le ${VG.formatDate(delivered.at)}), faute de quoi une pénalité de ${VG.MATERIAL_PENALTY} € s'applique (voir CGV).</p></div>`;
    }

    // Formulaire ou état de l'avis
    let reviewBlock = "";
    if (s === "terminee") {
      if (review) {
        const st = { en_attente: "en cours de validation par l'équipe", valide: "publié sur l'accueil", refuse: "non publié" }[review.status];
        reviewBlock = `<section class="card" id="avis"><h3>Mon avis</h3><p><strong>${review.rating} / 5</strong> · ${st}</p><p class="review-quote">« ${esc(review.comment)} »</p></section>`;
      } else {
        reviewBlock = `
          <section class="card" id="avis">
            <h3>Donner mon avis</h3>
            <p>Cet avis est lié uniquement à votre commande terminée ${order.id}.</p>
            <form id="review-form" novalidate>
              <p class="small"><strong>Votre note * · de 1 à 5</strong></p>
              <fieldset class="rating">
                <legend class="small muted">1 : très insatisfait · 5 : très satisfait</legend>
                ${[1, 2, 3, 4, 5].map((n) => `<input type="radio" name="rating" id="rate-${n}" value="${n}"><label for="rate-${n}">${n}</label>`).join("")}
              </fieldset>
              <div class="form-group">
                <label for="review-comment">Votre commentaire *</label>
                <textarea id="review-comment" rows="4" maxlength="600"></textarea>
              </div>
              <p class="small muted">Votre avis sera publié uniquement après validation. Évitez les données personnelles dans votre commentaire.</p>
              <div class="notice danger" id="review-error" role="alert" hidden></div>
              <button type="submit" class="btn-primary btn-submit">Envoyer mon avis</button>
            </form>
          </section>`;
      }
    }

    const manageBlock = s === "en_attente" ? `
      <section class="card">
        <h3>Gérer ma commande</h3>
        <a href="/account-order-edit?id=${order.id}" class="btn-primary btn-submit">Modifier ma commande</a>
        <button type="button" class="btn-secondary btn-submit" id="cancel-open" style="margin-top:12px">Annuler ma commande</button>
        <p class="small muted" style="margin-top:12px">Le menu ne peut pas être changé. Les autres informations restent modifiables.</p>
      </section>` : `
      <div class="notice"><span class="notice-title">Besoin d'une précision ?</span><p>Pour une question sur la prestation, contactez Vite & Gourmands en indiquant ${order.id}. Le contact ne constitue pas une modification de la commande.</p></div>
      <p><a href="/contact" class="inline-link">Contacter Vite & Gourmands &rarr;</a></p>`;

    content.innerHTML = `
      <section class="page-head">
        <h2>Commande ${order.id}${s === "terminee" ? " terminée" : ""}</h2>
        <p class="subtitle-desc">${subtitles[s] || "Votre commande a été acceptée. Retrouvez les étapes et les détails de votre prestation."}</p>
      </section>
      ${VGUI.accountNav("orders")}
      <p><a href="/account" class="inline-link">&larr; Retour à mes commandes</a></p>
      <p>${VGUI.statusBadge(s)}</p>
      ${banner}
      ${materialNotice}

      <div class="confirm-panel" id="cancel-panel" hidden tabindex="-1">
        <h3>Voulez-vous annuler la commande ${order.id} ?</h3>
        <p>L'annulation est définitive. Elle n'est possible que si la commande est toujours en attente au moment de la confirmation.</p>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="cancel-keep">Garder ma commande</button>
          <button type="button" class="btn-primary btn-danger" id="cancel-confirm">Confirmer l'annulation</button>
        </div>
      </div>

      <div class="layout-aside">
        <div>
          ${reviewBlock}
          ${s !== "en_attente" ? `<section class="card" id="suivi"><h3>Suivi de la commande</h3>${VGUI.timeline(order)}</section>` : ""}
          <section class="card">
            <h3>Prestation</h3>
            <p><strong>${VG.formatDate(order.date)} à ${esc(order.time)} · ${order.guests} convives</strong></p>
            <p>${VGUI.address(order.delivery)}</p>
            <p class="small muted">${order.price.km ? `Livraison hors Bordeaux · ${order.price.km} km.` : "Livraison dans Bordeaux."}</p>
          </section>
          <section class="card">
            <h3>Coordonnées client</h3>
            <p><strong>${esc(VG.fullName(order.client))}</strong></p>
            <p>${esc(order.client.email)}<br>${esc(order.client.phone)}</p>
            <p class="small muted">Adresse du compte</p>
            <p>${VGUI.address(order.accountAddress)}</p>
          </section>
          <section class="card">
            <h3>${esc(order.menuName)}</h3>
            <p>Minimum ${order.menuMin} personnes · ${VG.euro(order.perPerson)}/personne.</p>
            ${VGUI.dishSummary(order.dishes)}
            <p class="small muted">En cas d'allergie, contactez l'équipe pour vérifier la composition et les éventuelles traces avant toute demande.</p>
          </section>
        </div>
        <aside>
          <section class="card">
            <h3>Prix de la commande</h3>
            <p class="small muted">${esc(order.menuName)} · ${VG.euro(order.perPerson)}/personne</p>
            ${VGUI.priceList(order.price, order.guests, order.perPerson)}
          </section>
          ${manageBlock}
          ${menu ? `<section class="order-conditions">${VGUI.menuConditions(menu)}</section>` : ""}
        </aside>
      </div>`;

    bind();
  };

  const bind = () => {
    const panel = document.getElementById("cancel-panel");
    document.getElementById("cancel-open")?.addEventListener("click", () => { panel.hidden = false; panel.focus(); panel.scrollIntoView({ behavior: "smooth", block: "center" }); });
    document.getElementById("cancel-keep")?.addEventListener("click", () => (panel.hidden = true));
    document.getElementById("cancel-confirm")?.addEventListener("click", () => {
      if (order.status !== "en_attente") {
        panel.innerHTML = `<p>Cette commande a été acceptée entre-temps : elle ne peut plus être annulée.</p>`;
        return;
      }
      VG.setStatus(order, "annulee", VG.fullName(order.client), { reason: "Annulée par le client depuis son espace" });
      VG.save();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const reviewForm = document.getElementById("review-form");
    reviewForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const rating = reviewForm.querySelector('input[name="rating"]:checked');
      const comment = document.getElementById("review-comment").value.trim();
      const err = document.getElementById("review-error");
      if (!rating) return VGUI.showError(err, "Choisissez une note de 1 à 5.");
      if (comment.length < 10) return VGUI.showError(err, "Rédigez un commentaire d'au moins 10 caractères.");
      const review = {
        id: `r${Date.now()}`, orderId: order.id, email: order.client.email,
        name: `${order.client.firstName} ${order.client.lastName.charAt(0)}.`, rating: Number(rating.value), comment,
        status: "en_attente", createdAt: new Date().toISOString(), event: order.menuName,
      };
      VG.data.reviews.push(review);
      order.reviewId = review.id;
      VG.save();
      render();
      document.getElementById("avis").insertAdjacentHTML("afterbegin", `<div class="notice success" role="status"><p>Merci, votre avis a été transmis. Il sera publié après validation par l'équipe.</p></div>`);
    });
  };

  render();
})();
