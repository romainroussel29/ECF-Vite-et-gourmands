// Espace équipe : détail d'une commande.
// Suivi opérationnel, contact préalable obligatoire avant toute modification
// ou annulation, matériel prêté et journal de traçabilité.
(() => {
  const content = document.getElementById("st-content");
  if (!content) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const staff = VG.session.user();
  const author = staff ? VG.fullName(staff) : "Équipe";
  const order = VG.order(VG.param("id") || "");

  if (!order) {
    content.innerHTML = `<h2>Commande introuvable</h2><p><a href="/staff-orders" class="btn-primary">Retour aux commandes</a></p>`;
    return;
  }

  // Contact préalable validé (le temps de la visite de la page)
  let contact = null;
  let flash = "";

  const closed = () => order.status === "terminee" || order.status === "annulee";
  const materialLeft = () => order.material.reduce((n, m) => n + (m.lent - m.returned), 0);

  // Statuts proposés après le statut actuel
  const nextStatuses = () => {
    const i = VG.STATUS_FLOW.indexOf(order.status);
    if (i < 0) return [];
    return VG.STATUS_FLOW.slice(i + 1).filter((s) => {
      if (s === "attente_materiel") return order.material.length > 0;
      if (s === "terminee") return order.material.length === 0 || materialLeft() === 0;
      return true;
    });
  };

  const render = () => {
    document.title = `Commande ${order.id} - Vite et gourmands`;
    const menu = VG.menuById(order.menuId);
    const p = order.price;
    const delivered = VG.statusAt(order, "attente_materiel") || VG.statusAt(order, "livree");
    const overdue = order.status === "attente_materiel" && delivered && VG.workingDaysBetween(delivered.at, new Date().toISOString()) > VG.MATERIAL_DAYS;

    content.innerHTML = `
      <section class="page-head">
        <h2>Commande ${order.id}</h2>
        <p class="subtitle-desc">Prestation, suivi opérationnel, contact préalable et modifications. Chaque action est tracée dans le journal.</p>
      </section>
      <p><a href="/staff-orders" class="btn-secondary">&larr; Retour aux commandes</a></p>
      <p>${VGUI.statusBadge(order.status)}</p>
      ${flash}

      <div class="layout-aside">
        <section class="card">
          <h3>Prestation et coordonnées client</h3>
          <p><strong>${esc(VG.fullName(order.client))} · ${VG.formatDate(order.date)} à ${esc(order.time)} · ${order.guests} convives</strong></p>
          <p>${esc(order.client.email)}<br>${esc(order.client.phone)}<br>Adresse du compte : ${VGUI.address(order.accountAddress).replace(/<br>/g, ", ")}</p>
          <p>Livraison : ${VGUI.address(order.delivery).replace(/<br>/g, ", ")}<br>${p.km ? `Hors Bordeaux · ${p.km} km` : "Dans Bordeaux"}</p>
          <div class="btn-row">
            <a href="tel:${esc(order.client.phone.replace(/\s/g, ""))}" class="btn-secondary">Contacter par GSM</a>
            <a href="mailto:${esc(order.client.email)}?subject=${encodeURIComponent(`Votre commande ${order.id}`)}" class="btn-secondary">Rédiger un e-mail</a>
          </div>
          <p class="small muted" style="margin-top:10px">Coordonnées issues du dossier client. Aucun lien de contact ne modifie la commande.</p>
        </section>
        <section class="card">
          <h3>Prix de la commande</h3>
          ${VGUI.priceList(p, order.guests, order.perPerson)}
          ${order.penalty ? `<p><strong>Pénalité matériel : ${VG.euro(order.penalty)}</strong></p>` : ""}
        </section>
      </div>

      <section class="card">
        <h3>${esc(order.menuName)} · plats commandés</h3>
        <p class="small muted">${VG.euro(order.perPerson)}/personne · minimum ${order.menuMin} personnes${menu ? ` · stock actuel du menu : ${menu.stock}` : ""}</p>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Service</th><th>Plat</th><th>Allergènes</th></tr></thead>
          <tbody>${order.dishes.map((d) => `<tr><td>${VG.CATEGORY_LABELS[d.category]}</td><td>${esc(d.name)}</td><td>${d.allergens.length ? esc(d.allergens.join(", ")) : "Aucun allergène majeur"}</td></tr>`).join("")}</tbody>
        </table></div>
      </section>

      ${renderTracking()}
      ${renderMaterial(overdue, delivered)}
      ${closed() ? "" : renderContact()}
      ${contact && contact.action === "modifier" ? renderEditForm() : ""}
      ${contact && contact.action === "annuler" ? renderCancel() : ""}
      ${renderLog()}`;

    bind();
  };

  // ---------- Suivi opérationnel ----------
  const renderTracking = () => {
    const rows = VG.STATUS_FLOW.filter((s) => s !== "attente_materiel" || order.material.length > 0).map((s) => {
      const step = VG.statusAt(order, s);
      const state = s === order.status ? "État actuel" : step ? "Effectuée" : "À venir";
      return `<tr><td>${VG.STATUS[s]}</td><td>${step ? `${VG.formatDateTime(step.at)}<span class="cell-sub">${esc(step.author)}</span>` : "Non atteint"}</td><td>${state}${step?.reason ? `<span class="cell-sub">${esc(step.reason)}</span>` : ""}</td></tr>`;
    }).join("");
    const options = nextStatuses();
    const form = closed() || options.length === 0 ? `<p class="small muted">${order.status === "attente_materiel" ? "La commande passera à « Terminée » à l'enregistrement de la restitution du matériel." : "Aucun changement de statut possible pour cette commande."}</p>` : `
      <form id="status-form" novalidate>
        <div class="form-grid-2">
          <div class="form-group">
            <label for="st-status">Nouveau statut opérationnel *</label>
            <select id="st-status">${options.map((s) => `<option value="${s}">${VG.STATUS[s]}</option>`).join("")}</select>
          </div>
          <div class="form-group">
            <label for="st-reason">Motif du changement de statut *</label>
            <input type="text" id="st-reason" placeholder="Ex : prise en charge de la commande" />
          </div>
        </div>
        <div class="notice danger" id="status-error" role="alert" hidden></div>
        <button type="submit" class="btn-primary">Confirmer le changement de statut</button>
      </form>`;
    return `
      <section class="card">
        <h3>Suivi opérationnel</h3>
        ${order.status === "annulee" ? `<div class="notice danger"><p>Commande annulée le ${VG.formatDateTime(order.history[order.history.length - 1].at)}.</p></div>` : ""}
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Étape</th><th>Date / auteur</th><th>État</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
        ${form}
        <p class="small muted">Le suivi n'est pas une modification de la commande : changer les informations ou annuler passe par le contact préalable ci-dessous.</p>
      </section>`;
  };

  // ---------- Matériel prêté ----------
  const renderMaterial = (overdue, delivered) => {
    const canAdd = ["acceptee", "en_preparation", "en_livraison", "livree"].includes(order.status);
    if (order.material.length === 0 && !canAdd) return "";
    const returning = order.status === "attente_materiel";
    const rows = order.material.map((m, i) => `
      <tr>
        <td>${esc(m.name)}</td><td>${m.lent}</td>
        <td>${returning ? `<input type="number" class="mat-returned" data-index="${i}" min="${m.returned}" max="${m.lent}" value="${m.returned}" aria-label="Quantité restituée : ${esc(m.name)}" style="width:80px">` : m.returned}</td>
        <td>${m.lent - m.returned}</td>
      </tr>`).join("");
    return `
      <section class="card">
        <h3>Matériel prêté</h3>
        ${overdue ? `<div class="notice danger"><span class="notice-title">Délai dépassé</span><p>Plus de ${VG.MATERIAL_DAYS} jours ouvrés depuis le ${VG.formatDate(delivered.at)} : la pénalité de ${VG.MATERIAL_PENALTY} € prévue aux CGV est applicable.</p>${order.penalty ? "" : `<button type="button" class="btn-secondary" id="mat-penalty" style="margin-top:10px">Appliquer la pénalité de ${VG.MATERIAL_PENALTY} €</button>`}</div>` : ""}
        ${returning && !overdue && delivered ? `<div class="notice"><p>Restitution attendue sous ${VG.MATERIAL_DAYS} jours ouvrés après le ${VG.formatDate(delivered.at)}. Un mail de restitution a été envoyé au client.</p></div>` : ""}
        ${order.material.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Matériel</th><th>Prêté</th><th>Restitué</th><th>Reste dû</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="muted">Aucun matériel prêté pour cette commande.</p>`}
        ${returning ? `<button type="button" class="btn-primary" id="mat-save">Enregistrer la restitution</button><p class="small muted">Quand tout le matériel est rendu, la commande passe automatiquement à « Terminée » et le client est invité à donner son avis.</p>` : ""}
        ${canAdd ? `
          <form id="mat-form" class="range-row" novalidate style="margin-top:15px">
            <div class="form-group"><label for="mat-name">Matériel</label><input type="text" id="mat-name" placeholder="Ex : bacs isothermes" /></div>
            <div class="form-group"><label for="mat-qty">Quantité</label><input type="number" id="mat-qty" min="1" value="1" /></div>
            <div class="form-group"><button type="submit" class="btn-secondary">Ajouter</button></div>
          </form>` : ""}
      </section>`;
  };

  // ---------- Contact préalable ----------
  const renderContact = () => {
    if (contact) {
      return `<div class="notice success"><span class="notice-title">Contact préalable validé</span><p>${contact.action === "modifier" ? "Modification" : "Annulation"} · ${contact.mode} · ${VG.formatDateTime(contact.at)} · ${esc(contact.reason)}</p></div>`;
    }
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return `
      <section class="card">
        <h3>Contact préalable · obligatoire avant de modifier ou d'annuler</h3>
        <div class="notice"><p>Modifier ou annuler une commande n'est possible qu'après un contact réel avec le client, par GSM ou par e-mail, et la saisie d'un motif mentionnant ce mode.</p></div>
        <form id="contact-form" novalidate>
          <div class="form-grid-2">
            <div class="form-group">
              <span class="small"><strong>Type d'action *</strong></span>
              <div class="radio-row">
                <label class="check-line"><input type="radio" name="ct-action" value="modifier" checked /> Modifier</label>
                <label class="check-line"><input type="radio" name="ct-action" value="annuler" /> Annuler</label>
              </div>
            </div>
            <div class="form-group">
              <span class="small"><strong>Contact réellement effectué *</strong></span>
              <label class="check-line radio-row"><input type="checkbox" id="ct-done" /> Oui, j'ai contacté le client</label>
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <span class="small"><strong>Mode de contact *</strong></span>
              <div class="radio-row">
                <label class="check-line"><input type="radio" name="ct-mode" value="GSM" /> GSM</label>
                <label class="check-line"><input type="radio" name="ct-mode" value="E-mail" /> E-mail</label>
              </div>
            </div>
            <div class="form-group">
              <label for="ct-date">Date et heure du contact *</label>
              <input type="datetime-local" id="ct-date" max="${now}" value="${now}" />
            </div>
          </div>
          <div class="form-group">
            <label for="ct-reason">Motif incluant le mode de contact *</label>
            <textarea id="ct-reason" rows="3" placeholder="Ex : appel GSM du client, passage de 15 à 20 convives"></textarea>
          </div>
          <div class="notice danger" id="contact-error" role="alert" hidden></div>
          <button type="submit" class="btn-primary">Valider le contact préalable</button>
        </form>
      </section>`;
  };

  // ---------- Modification après contact ----------
  const renderEditForm = () => `
    <section class="card">
      <h3>Modifier les informations de la commande</h3>
      <p class="small muted">Le menu ne change pas. Enregistrement possible uniquement après le contact préalable validé ci-dessus.</p>
      <form id="edit-form" novalidate>
        <div class="grid-3">
          <div class="form-group"><label for="ed-date">Date de prestation *</label><input type="date" id="ed-date" value="${order.date}" /></div>
          <div class="form-group"><label for="ed-time">Heure *</label><input type="time" id="ed-time" value="${esc(order.time)}" /></div>
          <div class="form-group"><label for="ed-guests">Convives · minimum ${order.menuMin}</label><input type="number" id="ed-guests" min="${order.menuMin}" value="${order.guests}" /></div>
        </div>
        <div class="form-group"><label for="ed-street">Adresse de livraison *</label><input type="text" id="ed-street" value="${esc(order.delivery.street)}" /></div>
        <div class="grid-3">
          <div class="form-group"><label for="ed-extra">Complément</label><input type="text" id="ed-extra" value="${esc(order.delivery.extra || "")}" /></div>
          <div class="form-group"><label for="ed-zip">Code postal *</label><input type="text" id="ed-zip" value="${esc(order.delivery.zip)}" /></div>
          <div class="form-group"><label for="ed-city">Ville *</label><input type="text" id="ed-city" value="${esc(order.delivery.city)}" /></div>
        </div>
        <h4>Comparatif de prix avant confirmation</h4>
        <div class="table-wrap" id="ed-compare"></div>
        <div class="notice danger" id="edit-error" role="alert" hidden></div>
        <div class="btn-row">
          <button type="button" class="btn-secondary" id="ed-abort">Abandonner</button>
          <button type="submit" class="btn-primary">Confirmer la modification</button>
        </div>
      </form>
    </section>`;

  const renderCancel = () => `
    <div class="confirm-panel">
      <h3>Annuler la commande ${order.id} ?</h3>
      <p>Contact effectué · ${esc(contact.mode)} · ${VG.formatDateTime(contact.at)}<br>Motif : ${esc(contact.reason)}</p>
      <p>Transition : ${VG.STATUS[order.status]} → Annulée. La commande et son historique restent consultables, et le menu est remis en stock.</p>
      <div class="btn-row">
        <button type="button" class="btn-secondary" id="cancel-keep">Garder la commande</button>
        <button type="button" class="btn-primary btn-danger" id="cancel-confirm">Confirmer l'annulation</button>
      </div>
    </div>`;

  // ---------- Journal ----------
  const renderLog = () => `
    <section class="card">
      <h3>Journal de traçabilité</h3>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Date / auteur</th><th>Action</th><th>Détail / contact</th></tr></thead>
        <tbody>${order.log.length ? order.log.map((l) => `
          <tr><td>${VG.formatDateTime(l.at)}<span class="cell-sub">${esc(l.author)}</span></td><td>${esc(l.action)}</td>
          <td>${esc(l.detail)}${l.contact ? `<span class="cell-sub">Contact : ${esc(l.contact)}</span>` : ""}</td></tr>`).join("")
          : `<tr class="empty-row"><td colspan="3">Aucune action enregistrée depuis la création.</td></tr>`}</tbody>
      </table></div>
      <p class="small muted">Les actions tracées ne sont jamais supprimées : auteur, date et heure, ancien et nouvel état, motif et mode de contact.</p>
    </section>`;

  // ---------- Comparatif de prix ----------
  const compare = () => {
    const box = $("ed-compare");
    if (!box) return;
    const guests = parseInt($("ed-guests").value, 10) || 0;
    const menu = VG.menuById(order.menuId) || { price: order.perPerson * order.menuMin, min: order.menuMin };
    const draft = VG.computePrice(menu, guests, $("ed-city").value);
    const now = order.price;
    const row = (label, a, b) => `<tr><td>${label}</td><td>${a}</td><td>${b}</td></tr>`;
    box.innerHTML = `<table class="data-table"><thead><tr><th>Ligne</th><th>Actuel · ${order.guests} convives</th><th>Modifié · ${guests} convives</th></tr></thead><tbody>
      ${row("Menu brut", VG.euro(now.base), VG.euro(draft.base))}
      ${row("Remise 10 %", now.discount ? "−" + VG.euro(now.discount) : "—", draft.discount ? "−" + VG.euro(draft.discount) : "—")}
      ${row("Livraison", VG.euro(now.deliveryFee), VG.euro(draft.deliveryFee))}
      ${row("<strong>Total TTC</strong>", `<strong>${VG.euro(now.total)}</strong>`, `<strong>${VG.euro(draft.total)}</strong>`)}
      ${row("Écart TTC", "—", (draft.total - now.total >= 0 ? "+" : "−") + VG.euro(Math.abs(draft.total - now.total)))}
    </tbody></table>`;
    return draft;
  };

  // ---------- Événements ----------
  const done = (message) => { flash = `<div class="notice success" role="status"><p>${message}</p></div>`; VG.save(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const bind = () => {
    $("status-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const reason = $("st-reason").value.trim();
      if (!reason) return VGUI.showError($("status-error"), "Indiquez le motif du changement de statut.");
      const status = $("st-status").value;
      const previous = VG.STATUS[order.status];
      VG.setStatus(order, status, author, { reason });
      if (status === "attente_materiel") VG.addLog(order, { author: "Système", action: "Mail de restitution envoyé", detail: `Restitution sous ${VG.MATERIAL_DAYS} jours ouvrés, pénalité de ${VG.MATERIAL_PENALTY} € au-delà`, contact: "" });
      if (status === "terminee") VG.addLog(order, { author: "Système", action: "Mail d'invitation à donner un avis envoyé", detail: "", contact: "" });
      done(`Statut mis à jour : ${previous} → ${VG.STATUS[status]}.`);
    });

    $("mat-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("mat-name").value.trim();
      const qty = parseInt($("mat-qty").value, 10);
      if (!name || !qty || qty < 1) return;
      order.material.push({ name, lent: qty, returned: 0 });
      VG.addLog(order, { author, action: "Matériel prêté ajouté", detail: `${qty} × ${name}`, contact: "" });
      done(`Matériel ajouté : ${qty} × ${name}.`);
    });

    $("mat-save")?.addEventListener("click", () => {
      content.querySelectorAll(".mat-returned").forEach((input) => {
        const m = order.material[input.dataset.index];
        m.returned = Math.min(m.lent, Math.max(m.returned, parseInt(input.value, 10) || 0));
      });
      VG.addLog(order, { author, action: "Restitution du matériel enregistrée", detail: order.material.map((m) => `${m.name} : ${m.returned}/${m.lent}`).join(" · "), contact: "" });
      if (materialLeft() === 0) {
        VG.setStatus(order, "terminee", author, { reason: "Matériel entièrement restitué" });
        VG.addLog(order, { author: "Système", action: "Mail d'invitation à donner un avis envoyé", detail: "", contact: "" });
        return done("Matériel entièrement restitué : la commande est terminée.");
      }
      done("Restitution partielle enregistrée.");
    });

    $("mat-penalty")?.addEventListener("click", () => {
      order.penalty = VG.MATERIAL_PENALTY;
      VG.addLog(order, { author, action: "Pénalité matériel appliquée", detail: `${VG.MATERIAL_PENALTY} € · délai de ${VG.MATERIAL_DAYS} jours ouvrés dépassé`, contact: "" });
      done(`Pénalité de ${VG.MATERIAL_PENALTY} € appliquée.`);
    });

    $("contact-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("contact-error");
      const action = content.querySelector('input[name="ct-action"]:checked').value;
      const mode = content.querySelector('input[name="ct-mode"]:checked')?.value;
      const at = $("ct-date").value;
      const reason = $("ct-reason").value.trim();
      if (!$("ct-done").checked) return VGUI.showError(err, "Le contact préalable doit être effectué et attesté.");
      if (!mode) return VGUI.showError(err, "Sélectionnez le mode utilisé (GSM ou e-mail).");
      if (!at) return VGUI.showError(err, "Renseignez la date et l'heure du contact réel.");
      if (new Date(at) > new Date()) return VGUI.showError(err, "La date du contact ne peut pas être dans le futur.");
      const modeWords = mode === "GSM" ? ["gsm", "appel", "telephone", "tel"] : ["mail", "e-mail", "courriel"];
      if (reason.length < 10 || !modeWords.some((w) => VG.normalize(reason).includes(w))) {
        return VGUI.showError(err, `Indiquez la raison de l'action et mentionnez le mode de contact (${mode === "GSM" ? "GSM ou appel" : "e-mail"}) dans le motif.`);
      }
      contact = { action, mode, at: new Date(at).toISOString(), reason };
      flash = "";
      render();
      compare();
      (action === "modifier" ? $("ed-date") : $("cancel-confirm"))?.focus();
    });

    const editForm = $("edit-form");
    if (editForm) {
      compare();
      editForm.addEventListener("input", compare);
      $("ed-abort").addEventListener("click", () => { contact = null; render(); });
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const err = $("edit-error");
        const guests = parseInt($("ed-guests").value, 10);
        if (!$("ed-date").value || !$("ed-time").value) return VGUI.showError(err, "Renseignez la date et l'heure de prestation.");
        if (!guests || guests < order.menuMin) return VGUI.showError(err, `Minimum ${order.menuMin} convives pour ce menu.`);
        if (!$("ed-street").value.trim() || !/^\d{5}$/.test($("ed-zip").value.trim()) || !$("ed-city").value.trim()) return VGUI.showError(err, "Renseignez une adresse de livraison complète (code postal à 5 chiffres).");
        const before = `${order.guests} convives · ${VG.formatDate(order.date)} ${order.time} · ${VG.euro(order.price.total)}`;
        const draft = compare();
        order.date = $("ed-date").value; order.time = $("ed-time").value; order.guests = guests;
        ["street", "extra", "zip", "city"].forEach((k) => (order.delivery[k] = $(`ed-${k}`).value.trim()));
        order.price = draft;
        VG.addLog(order, {
          author, action: "Modification après contact",
          detail: `${before} → ${guests} convives · ${VG.formatDate(order.date)} ${order.time} · ${VG.euro(draft.total)}. ${contact.reason}`,
          contact: `${contact.mode} · ${VG.formatDateTime(contact.at)}`,
        });
        contact = null;
        done("Modification enregistrée et tracée dans le journal.");
      });
    }

    $("cancel-keep")?.addEventListener("click", () => { contact = null; render(); });
    $("cancel-confirm")?.addEventListener("click", () => {
      VG.setStatus(order, "annulee", author, { reason: contact.reason, contact: `${contact.mode} · ${VG.formatDateTime(contact.at)}` });
      contact = null;
      done("Commande annulée. Le menu a été remis en stock.");
    });
  };

  render();
})();
