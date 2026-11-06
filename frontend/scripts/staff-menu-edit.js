// Espace équipe : création et modification d'un menu du catalogue.
(() => {
  const form = document.getElementById("menu-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const staff = VG.session.user();
  const existing = VG.menuById(VG.param("id") || "");
  const isNew = !existing;

  // Brouillon de travail (copie du menu ou menu vide)
  const draft = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: `m${Date.now()}`, slug: "", name: "", theme: "Classique", diet: "Classique", otherDiet: "", desc: "",
    price: 0, min: 10, stock: 5, delay: 7, status: "brouillon", visible: false, order: VG.data.menus.length + 1,
    storage: "Conserver entre 0 et +4 °C et consommer dans les 24 heures suivant la livraison. Ne pas rompre la chaîne du froid.",
    conditions: "Commande confirmée par l'équipe selon le stock disponible. Modalités de prestation et d'annulation : voir les CGV.",
    images: [], dishes: [],
  };

  // ---------- Liste latérale ----------
  const renderList = () => {
    const q = VG.normalize($("me-search").value);
    const menus = VG.menus().filter((m) => !q || VG.normalize(m.name).includes(q));
    $("me-count").textContent = `${VG.data.menus.length} menus · ${VG.data.menus.filter((m) => m.status === "publie").length} publiés`;
    $("me-list").innerHTML = menus.map((m) => `
      <div class="dish-pick" ${m.id === draft.id ? 'style="border-color:var(--color-dark)"' : ""}>
        <p><strong>${esc(m.name)}</strong></p>
        <p><span class="badge ${m.status}">${VG.MENU_STATUS[m.status]}</span></p>
        <p class="small">${m.min} pers. min. · ${VG.euro(m.price)} TTC<br><span class="muted">${m.stock} commandes restantes</span></p>
        ${m.id === draft.id ? `<p class="small"><strong>En cours d'édition</strong></p>` : `<a href="/staff-menu-edit?id=${m.id}" class="inline-link small">Modifier &rarr;</a>`}
      </div>`).join("");
  };

  // ---------- Galerie ----------
  const renderGallery = () => {
    $("me-gallery-info").textContent = `${draft.images.length} image${draft.images.length > 1 ? "s" : ""} associée${draft.images.length > 1 ? "s" : ""} · la première est l'image de couverture du catalogue.`;
    $("me-gallery").innerHTML = draft.images.map((img, i) => `
      <div class="gallery-item">
        <img src="/frontend/images/${esc(img.file)}" alt="">
        <div>
          <p class="small"><strong>${esc(img.file)}</strong>${i === 0 ? " · couverture" : ""}</p>
          <div class="form-group">
            <label for="me-alt-${i}">Texte alternatif *</label>
            <input type="text" id="me-alt-${i}" data-alt="${i}" value="${esc(img.alt)}" />
          </div>
          <div class="btn-row">
            <button type="button" class="link-btn" data-move="${i}:-1" ${i === 0 ? "disabled" : ""}>Monter</button>
            <button type="button" class="link-btn" data-move="${i}:1" ${i === draft.images.length - 1 ? "disabled" : ""}>Descendre</button>
            <button type="button" class="link-btn danger" data-remove-img="${i}">Retirer</button>
          </div>
        </div>
      </div>`).join("") || `<p class="muted">Aucune image pour le moment.</p>`;
    const used = draft.images.map((i) => i.file);
    $("me-add-image").innerHTML = VG.IMAGES.filter((f) => !used.includes(f)).map((f) => `<option value="${f}">${f}</option>`).join("") || `<option value="">Toutes les images sont déjà utilisées</option>`;
  };

  // ---------- Plats ----------
  const renderDishes = () => {
    const q = VG.normalize($("me-dish-search").value);
    const counts = { entree: 0, plat: 0, dessert: 0 };
    draft.dishes.forEach((id) => { const d = VG.dish(id); if (d) counts[d.category]++; });
    $("me-dish-count").textContent = `${draft.dishes.length} plats sélectionnés · ${counts.entree} entrée${counts.entree > 1 ? "s" : ""}, ${counts.plat} plat${counts.plat > 1 ? "s" : ""}, ${counts.dessert} dessert${counts.dessert > 1 ? "s" : ""}`;
    $("me-dishes").innerHTML = ["entree", "plat", "dessert"].map((cat) => `
      <div>
        <h4>${VG.CATEGORY_LABELS[cat]}s</h4>
        ${VG.data.dishes.filter((d) => d.category === cat && (!q || VG.normalize(d.name).includes(q) || draft.dishes.includes(d.id))).map((d) => {
          const others = VG.menusUsingDish(d.id).filter((m) => m.id !== draft.id).length;
          return `
            <div class="dish-pick">
              <label class="check-line"><input type="checkbox" data-dish="${d.id}" ${draft.dishes.includes(d.id) ? "checked" : ""} /> ${esc(d.name)}</label>
              <span class="small muted">Allergènes : ${d.allergens.length ? esc(d.allergens.join(", ")) : "aucun"}${others ? ` · réutilisé dans ${others} autre${others > 1 ? "s" : ""} menu${others > 1 ? "s" : ""}` : ""}</span>
            </div>`;
        }).join("")}
      </div>`).join("");
  };

  const renderRecap = () => {
    const min = parseInt($("me-min").value, 10) || 0;
    const price = parseFloat($("me-price").value) || 0;
    $("me-price-recap").textContent = min && price ? `Récapitulatif : ${VG.euro(price)} TTC pour ${min} personnes, soit ${VG.euro(price / min)} / personne.` : "";
  };

  // ---------- Remplissage ----------
  $("me-title").textContent = isNew ? "Nouveau menu" : `Modifier « ${draft.name} » · ${draft.dishes.length} plats associés`;
  $("me-name").value = draft.name;
  $("me-desc").value = draft.desc;
  $("me-theme").value = draft.theme;
  $("me-diet").value = draft.diet;
  $("me-other").value = draft.otherDiet || "";
  $("me-min").value = draft.min;
  $("me-price").value = draft.price || "";
  $("me-stock").value = draft.stock;
  $("me-delay").value = draft.delay;
  $("me-storage").value = draft.storage;
  $("me-conditions").value = draft.conditions;
  $("me-status").value = draft.status;
  $("me-visible").checked = draft.visible;
  if (!isNew) { $("me-public").hidden = false; $("me-public").setAttribute("href", `/menu-${draft.slug}`); }

  // ---------- Événements ----------
  form.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.move) {
      const [i, dir] = t.dataset.move.split(":").map(Number);
      const [img] = draft.images.splice(i, 1);
      draft.images.splice(i + dir, 0, img);
      renderGallery();
    }
    if (t.dataset.removeImg) { draft.images.splice(Number(t.dataset.removeImg), 1); renderGallery(); }
    if (t.id === "me-add-image-btn" && $("me-add-image").value) {
      draft.images.push({ file: $("me-add-image").value, alt: "" });
      renderGallery();
      $(`me-alt-${draft.images.length - 1}`).focus();
    }
  });

  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.alt !== undefined) draft.images[t.dataset.alt].alt = t.value;
    if (t.id === "me-min" || t.id === "me-price") renderRecap();
    if (t.id === "me-dish-search") renderDishes();
  });
  form.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.dish) {
      draft.dishes = t.checked ? [...draft.dishes, t.dataset.dish] : draft.dishes.filter((id) => id !== t.dataset.dish);
      renderDishes();
    }
  });
  $("me-search").addEventListener("input", renderList);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("me-error");
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    const fail = (id, message) => { if (id) { $(id).setAttribute("aria-invalid", "true"); $(id).focus(); } VGUI.showError(err, message); };

    const name = $("me-name").value.trim();
    const min = parseInt($("me-min").value, 10);
    const price = parseFloat($("me-price").value);
    const stock = parseInt($("me-stock").value, 10);
    const delay = parseInt($("me-delay").value, 10);
    if (!name) return fail("me-name", "Saisissez le titre du menu.");
    const slug = VG.slugify(name);
    if (VG.data.menus.some((m) => m.id !== draft.id && m.slug === slug)) return fail("me-name", "Un autre menu porte déjà ce titre.");
    if (!$("me-desc").value.trim()) return fail("me-desc", "Saisissez la description du menu.");
    if (!$("me-theme").value.trim()) return fail("me-theme", "Indiquez le thème du menu.");
    if (draft.images.length === 0) return fail(null, "Ajoutez au moins une image au menu.");
    const missingAlt = draft.images.findIndex((i) => !i.alt.trim());
    if (missingAlt >= 0) return fail(`me-alt-${missingAlt}`, "Chaque image doit avoir un texte alternatif.");
    const cats = draft.dishes.map((id) => VG.dish(id)?.category);
    if (!["entree", "plat", "dessert"].every((c) => cats.includes(c))) return fail(null, "Associez au moins une entrée, un plat et un dessert.");
    if (!min || min < 1) return fail("me-min", "Le nombre minimum de personnes doit être un entier supérieur ou égal à 1.");
    if (!price || price <= 0) return fail("me-price", "Indiquez un prix total TTC supérieur à 0.");
    if (Number.isNaN(stock) || stock < 0) return fail("me-stock", "Le stock doit être un nombre entier supérieur ou égal à 0.");
    if (Number.isNaN(delay) || delay < 0) return fail("me-delay", "Le délai doit être un nombre entier de jours.");
    if (!$("me-storage").value.trim()) return fail("me-storage", "Indiquez les précautions de stockage.");

    Object.assign(draft, {
      name, slug, desc: $("me-desc").value.trim(), theme: $("me-theme").value.trim(), diet: $("me-diet").value,
      otherDiet: $("me-other").value.trim(), min, price: Math.round(price * 100) / 100, stock, delay,
      storage: $("me-storage").value.trim(), conditions: $("me-conditions").value.trim(),
      status: $("me-status").value, visible: $("me-visible").checked,
      updatedAt: new Date().toISOString(), updatedBy: staff ? VG.fullName(staff) : "Équipe",
    });
    if (isNew) VG.data.menus.push(draft);
    else Object.assign(existing, JSON.parse(JSON.stringify(draft)));
    VG.save();

    if (isNew) return navigateTo(`/staff-menu-edit?id=${draft.id}&saved=1`);
    $("me-title").textContent = `Modifier « ${draft.name} » · ${draft.dishes.length} plats associés`;
    $("me-public").setAttribute("href", `/menu-${draft.slug}`);
    err.hidden = true;
    $("me-flash").innerHTML = `<div class="notice success" role="status"><p>Menu enregistré${draft.status === "publie" && draft.visible ? " et visible dans le catalogue public" : ""}.</p></div>`;
    $("me-flash").scrollIntoView({ behavior: "smooth", block: "center" });
    renderList();
  });

  if (VG.param("saved")) $("me-flash").innerHTML = `<div class="notice success" role="status"><p>Menu créé.</p></div>`;
  renderList();
  renderGallery();
  renderDishes();
  renderRecap();
})();
