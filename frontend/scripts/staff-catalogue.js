// Espace équipe : catalogue (menus, bibliothèque de plats) et horaires.
(() => {
  const page = document.getElementById("page-staff-catalogue");
  if (!page) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const flash = (message, type = "success") => {
    $("cat-flash").innerHTML = `<div class="notice ${type}" role="status"><p>${message}</p></div>`;
    $("cat-flash").scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ==================== MENUS ====================
  const renderMenus = () => {
    const q = VG.normalize($("cat-menu-search").value);
    const st = $("cat-menu-status").value;
    const menus = VG.menus().filter((m) => (!q || VG.normalize(m.name).includes(q)) && (!st || m.status === st));
    $("cat-menus-title").textContent = `Menus · ${menus.length} résultat${menus.length > 1 ? "s" : ""}`;
    $("cat-menus").innerHTML = menus.length === 0
      ? `<tr class="empty-row"><td colspan="4">Aucun menu ne correspond.</td></tr>`
      : menus.map((m) => `
        <tr>
          <td><strong>${esc(m.name)}</strong><span class="cell-sub">${esc(m.theme)} · ${esc(m.diet)}${m.visible ? "" : " · masqué du catalogue"}</span></td>
          <td><span class="badge ${m.status}">${VG.MENU_STATUS[m.status]}</span><span class="cell-sub">${m.min} pers. min. · ${VG.euro(m.price)} TTC</span></td>
          <td>${m.stock} commande${m.stock > 1 ? "s" : ""} restante${m.stock > 1 ? "s" : ""}</td>
          <td><a href="/staff-menu-edit?id=${m.id}">Modifier &rarr;</a> · <button type="button" class="link-btn danger" data-delete-menu="${m.id}">Supprimer</button></td>
        </tr>`).join("");
  };

  const askDeleteMenu = (id) => {
    const m = VG.menuById(id);
    const active = VG.data.orders.filter((o) => o.menuId === id && !["terminee", "annulee"].includes(o.status)).length;
    $("cat-menu-confirm").innerHTML = `
      <div class="confirm-panel" tabindex="-1" id="menu-confirm-panel">
        <h3>Supprimer le menu « ${esc(m.name)} » du catalogue ?</h3>
        <p>Le menu ne sera plus proposé pour de nouvelles commandes. Les fiches plats et l'historique des commandes sont conservés.${active ? ` <strong>${active} commande${active > 1 ? "s" : ""} en cours</strong> reste${active > 1 ? "nt" : ""} à honorer.` : ""}</p>
        <div class="btn-row">
          <button type="button" class="btn-secondary" data-menu-cancel>Annuler</button>
          <button type="button" class="btn-primary btn-danger" data-menu-confirm="${id}">Confirmer la suppression du menu</button>
        </div>
      </div>`;
    $("menu-confirm-panel").focus();
  };

  // ==================== PLATS ====================
  let editingDish = null; // id du plat ouvert, ou "new"

  const renderDishes = () => {
    const q = VG.normalize($("cat-dish-search").value);
    const dishes = VG.data.dishes.filter((d) => !q || VG.normalize(`${d.name} ${VG.CATEGORY_LABELS[d.category]}`).includes(q));
    $("cat-dishes-title").textContent = `Bibliothèque de plats · ${VG.data.dishes.length} fiches`;
    $("cat-dishes").innerHTML = dishes.length === 0
      ? `<tr class="empty-row"><td colspan="4">Aucun plat ne correspond.</td></tr>`
      : dishes.map((d) => {
        const used = VG.menusUsingDish(d.id);
        return `
          <tr>
            <td>${esc(d.name)}</td>
            <td>${VG.CATEGORY_LABELS[d.category]}<span class="cell-sub">${d.allergens.length ? esc(d.allergens.join(", ")) : "Aucun allergène majeur"}</span></td>
            <td>${used.length ? used.map((m) => esc(m.name)).join(" / ") : "Aucun menu"}</td>
            <td><button type="button" class="link-btn" data-edit-dish="${d.id}">Modifier</button> · <button type="button" class="link-btn danger" data-delete-dish="${d.id}">Supprimer</button></td>
          </tr>`;
      }).join("");
  };

  const renderDishPanel = (deleteMode = false) => {
    const panel = $("cat-dish-panel");
    if (!editingDish) { panel.innerHTML = ""; return; }
    const isNew = editingDish === "new";
    const d = isNew ? { name: "", category: "entree", allergens: [] } : VG.dish(editingDish);
    const used = isNew ? [] : VG.menusUsingDish(d.id);

    if (deleteMode) {
      panel.innerHTML = used.length ? `
        <div class="confirm-panel" tabindex="-1">
          <h3>Suppression définitive du plat « ${esc(d.name)} »</h3>
          <p><span class="badge annulee">Bloqué · ${used.length} menu${used.length > 1 ? "s" : ""} utilise${used.length > 1 ? "nt" : ""} cette fiche</span></p>
          <p>Retirez d'abord le plat de ${used.map((m) => `« ${esc(m.name)} »`).join(" et ")} depuis la fiche du plat ou l'édition du menu.</p>
          <div class="btn-row"><button type="button" class="btn-secondary" data-dish-close>Fermer</button><button type="button" class="btn-primary" data-edit-dish="${d.id}">Ouvrir la fiche du plat</button></div>
        </div>` : `
        <div class="confirm-panel" tabindex="-1">
          <h3>Supprimer le plat « ${esc(d.name)} » ?</h3>
          <p>Aucun menu n'utilise cette fiche. Les commandes passées conservent une copie du plat et de ses allergènes : elles ne sont pas modifiées.</p>
          <div class="btn-row"><button type="button" class="btn-secondary" data-dish-close>Annuler</button><button type="button" class="btn-primary btn-danger" data-dish-delete-confirm="${d.id}">Confirmer la suppression</button></div>
        </div>`;
      panel.querySelector(".confirm-panel").focus();
      return;
    }

    panel.innerHTML = `
      <section class="card">
        <h3>${isNew ? "Nouvelle fiche plat" : `Fiche partagée · ${esc(d.name)}`}</h3>
        ${used.length ? `<p><span class="badge">${used.length} dépendance${used.length > 1 ? "s" : ""} active${used.length > 1 ? "s" : ""}</span></p>` : ""}
        <form id="dish-form" novalidate>
          <div class="form-grid-2">
            <div class="form-group"><label for="dish-name">Nom du plat *</label><input type="text" id="dish-name" value="${esc(d.name)}" /></div>
            <div class="form-group"><label for="dish-cat">Catégorie du plat *</label>
              <select id="dish-cat">${Object.entries(VG.CATEGORY_LABELS).map(([v, l]) => `<option value="${v}" ${d.category === v ? "selected" : ""}>${l}</option>`).join("")}</select>
            </div>
          </div>
          <fieldset class="dish-group">
            <legend>Allergènes du plat · sélection multiple</legend>
            <div class="grid-3">${VG.ALLERGENS.map((a) => `<label class="check-line"><input type="checkbox" name="allergen" value="${a}" ${d.allergens.includes(a) ? "checked" : ""} /> ${a}</label>`).join("")}</div>
            <p class="small muted">Les 14 familles d'allergènes réglementaires. Aucune case cochée signifie « aucun allergène majeur ».</p>
          </fieldset>
          ${used.length ? `
            <div class="table-wrap"><table class="data-table"><thead><tr><th>Menu dépendant</th><th>Action</th></tr></thead><tbody>
              ${used.map((m) => `<tr><td>${esc(m.name)}</td><td><button type="button" class="link-btn" data-detach="${m.id}">Retirer de ${esc(m.name)}</button></td></tr>`).join("")}
            </tbody></table></div>
            <div class="notice"><p>Modifier cette fiche affecte ${used.length > 1 ? `les ${used.length} menus` : "le menu"} ci-dessus. Les commandes déjà passées conservent leurs données.</p></div>` : ""}
          <div class="notice danger" id="dish-error" role="alert" hidden></div>
          <div class="btn-row">
            <button type="submit" class="btn-primary">Enregistrer la fiche</button>
            <button type="button" class="btn-secondary" data-dish-close>Fermer</button>
          </div>
        </form>
      </section>`;
    $("dish-name").focus();
  };

  // ==================== HORAIRES ====================
  let draftHours = JSON.parse(JSON.stringify(VG.data.hours));

  const renderHours = () => {
    $("hours-days").innerHTML = draftHours.map((h, di) => `
      <div class="day-block">
        <h4>${h.day} · ${h.closed ? "Fermé" : "Ouvert"}</h4>
        ${h.closed ? "" : h.ranges.map((r, ri) => `
          <div class="range-row">
            <div class="form-group"><label for="h-${di}-${ri}-o">Ouverture</label><input type="time" id="h-${di}-${ri}-o" data-day="${di}" data-range="${ri}" data-field="open" value="${r.open}" /></div>
            <div class="form-group"><label for="h-${di}-${ri}-c">Fermeture</label><input type="time" id="h-${di}-${ri}-c" data-day="${di}" data-range="${ri}" data-field="close" value="${r.close}" /></div>
            <div class="form-group"><button type="button" class="btn-secondary btn-small" data-remove-range="${di}-${ri}">Supprimer cette plage</button></div>
          </div>`).join("")}
        <div class="btn-row">
          <label class="check-line"><input type="checkbox" data-closed="${di}" ${h.closed ? "checked" : ""} /> Fermé</label>
          ${h.closed ? "" : `<button type="button" class="btn-secondary btn-small" data-add-range="${di}">Ajouter une plage</button>`}
        </div>
      </div>`).join("");
    $("hours-preview").innerHTML = draftHours.map((h) => `<li><span>${h.day}</span> <span>${esc(VG.hoursText(h))}</span></li>`).join("");
  };

  const toMinutes = (t, isClose) => { const [h, m] = t.split(":").map(Number); const v = h * 60 + m; return isClose && v === 0 ? 24 * 60 : v; };
  const validateHours = () => {
    for (const h of draftHours) {
      if (h.closed) continue;
      if (h.ranges.length === 0) return `${h.day} : ajoutez une plage ou cochez « Fermé ».`;
      const sorted = [...h.ranges].sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
      for (let i = 0; i < sorted.length; i++) {
        const r = sorted[i];
        if (!r.open || !r.close) return `${h.day} : renseignez l'ouverture et la fermeture de chaque plage.`;
        if (toMinutes(r.close, true) <= toMinutes(r.open)) return `${h.day} : la fermeture doit être après l'ouverture (${r.open} – ${r.close}).`;
        if (i > 0 && toMinutes(r.open) < toMinutes(sorted[i - 1].close, true)) return `${h.day} : les plages ${sorted[i - 1].open}–${sorted[i - 1].close} et ${r.open}–${r.close} se chevauchent.`;
      }
    }
    return null;
  };

  // ==================== ÉVÉNEMENTS ====================
  page.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const ds = t.dataset;

    if (ds.deleteMenu) return askDeleteMenu(ds.deleteMenu);
    if (t.hasAttribute("data-menu-cancel")) { $("cat-menu-confirm").innerHTML = ""; return; }
    if (ds.menuConfirm) {
      const m = VG.menuById(ds.menuConfirm);
      VG.data.menus = VG.data.menus.filter((x) => x.id !== m.id);
      VG.save();
      $("cat-menu-confirm").innerHTML = "";
      renderMenus(); renderDishes();
      return flash(`Menu « ${esc(m.name)} » retiré du catalogue.`);
    }

    if (t.id === "cat-dish-new") { editingDish = "new"; return renderDishPanel(); }
    if (ds.editDish) { editingDish = ds.editDish; return renderDishPanel(); }
    if (ds.deleteDish) { editingDish = ds.deleteDish; return renderDishPanel(true); }
    if (t.hasAttribute("data-dish-close")) { editingDish = null; return renderDishPanel(); }
    if (ds.dishDeleteConfirm) {
      const d = VG.dish(ds.dishDeleteConfirm);
      VG.data.dishes = VG.data.dishes.filter((x) => x.id !== d.id);
      VG.save();
      editingDish = null;
      renderDishPanel(); renderDishes();
      return flash(`Plat « ${esc(d.name)} » supprimé de la bibliothèque.`);
    }
    if (ds.detach) {
      const m = VG.menuById(ds.detach);
      const d = VG.dish(editingDish);
      m.dishes = m.dishes.filter((id) => id !== d.id);
      VG.save();
      renderDishPanel(); renderDishes(); renderMenus();
      return flash(`« ${esc(d.name)} » retiré du menu « ${esc(m.name)} ». La fiche reste disponible dans la bibliothèque.`);
    }

    if (ds.addRange) { draftHours[ds.addRange].ranges.push({ open: "10:00", close: "15:00" }); return renderHours(); }
    if (ds.removeRange) { const [di, ri] = ds.removeRange.split("-").map(Number); draftHours[di].ranges.splice(ri, 1); if (!draftHours[di].ranges.length) draftHours[di].closed = true; return renderHours(); }
    if (t.id === "hours-reset") { draftHours = JSON.parse(JSON.stringify(VG.data.hours)); $("hours-error").hidden = true; return renderHours(); }
  });

  page.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.closed !== undefined) {
      const h = draftHours[t.dataset.closed];
      h.closed = t.checked;
      if (!h.closed && h.ranges.length === 0) h.ranges.push({ open: "10:00", close: "15:00" });
      renderHours();
    }
  });

  page.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.field) {
      draftHours[t.dataset.day].ranges[t.dataset.range][t.dataset.field] = t.value;
      $("hours-preview").innerHTML = draftHours.map((h) => `<li><span>${h.day}</span> <span>${esc(VG.hoursText(h))}</span></li>`).join("");
    }
    if (t.id === "cat-menu-search") renderMenus();
    if (t.id === "cat-dish-search") renderDishes();
  });
  $("cat-menu-status").addEventListener("change", renderMenus);

  page.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target.id === "hours-form") {
      const error = validateHours();
      if (error) return VGUI.showError($("hours-error"), error);
      $("hours-error").hidden = true;
      draftHours.forEach((h) => { if (h.closed) h.ranges = []; h.ranges.sort((a, b) => toMinutes(a.open) - toMinutes(b.open)); });
      VG.data.hours = JSON.parse(JSON.stringify(draftHours));
      VG.save();
      VG.renderFooterHours();
      renderHours();
      return flash("Horaires enregistrés : le pied de page du site est à jour.");
    }
    if (e.target.id === "dish-form") {
      const name = $("dish-name").value.trim();
      if (!name) return VGUI.showError($("dish-error"), "Saisissez le nom du plat.");
      const duplicate = VG.data.dishes.find((d) => VG.normalize(d.name) === VG.normalize(name) && d.id !== editingDish);
      if (duplicate) return VGUI.showError($("dish-error"), "Un plat porte déjà ce nom dans la bibliothèque.");
      const allergens = Array.from(page.querySelectorAll('input[name="allergen"]:checked')).map((i) => i.value);
      if (editingDish === "new") {
        VG.data.dishes.push({ id: `d${Date.now()}`, name, category: $("dish-cat").value, allergens });
      } else {
        Object.assign(VG.dish(editingDish), { name, category: $("dish-cat").value, allergens });
      }
      VG.save();
      editingDish = null;
      renderDishPanel(); renderDishes();
      flash(`Fiche « ${esc(name)} » enregistrée.`);
    }
  });

  renderMenus();
  renderDishes();
  renderHours();
})();
