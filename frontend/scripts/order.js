// Espace de commande : formulaire prérempli depuis le compte, plats du menu
// choisi, récapitulatif recalculé en direct, puis création de la commande.
(() => {
  const form = document.getElementById("order-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const user = VG.session.user();
  const error = $("order-error");
  if (!user) return;

  // ---------- Préremplissage depuis le compte ----------
  $("o-lastname").value = user.lastName;
  $("o-firstname").value = user.firstName;
  $("o-phone").value = user.phone;
  $("o-email").value = user.email;
  const fillAccountAddress = () => {
    $("o-street").value = user.street; $("o-zip").value = user.zip;
    $("o-city").value = user.city; $("o-extra").value = user.extra || "";
  };
  $("o-same-address").checked = true;
  fillAccountAddress();
  $("o-same-address").addEventListener("change", (e) => {
    if (e.target.checked) fillAccountAddress();
    else ["o-street", "o-zip", "o-city", "o-extra"].forEach((id) => ($(id).value = ""));
    update();
  });

  // ---------- Menus disponibles ----------
  const menus = VG.publicMenus().filter((m) => m.stock > 0);
  const select = $("o-menu");
  if (menus.length === 0) {
    $("order-form-block").innerHTML = `<div class="notice"><span class="notice-title">Aucun menu disponible</span><p>Tous nos menus sont complets pour le moment. <a href="/contact">Contactez l'équipe</a>.</p></div>`;
    return;
  }
  select.innerHTML = menus.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join("");
  const wanted = VG.menuBySlug(VG.param("menu") || "");
  if (wanted && menus.includes(wanted)) select.value = wanted.id;

  const currentMenu = () => VG.menuById(select.value);

  const setMenu = () => {
    const menu = currentMenu();
    $("order-conditions").innerHTML = VGUI.menuConditions(menu);
    $("o-menu-hint").textContent = `Minimum ${menu.min} personnes · ${VG.euro(menu.price / menu.min)}/personne · ${menu.stock} commande${menu.stock > 1 ? "s" : ""} encore disponible${menu.stock > 1 ? "s" : ""}.`;
    $("o-guests").min = menu.min;
    if (!$("o-guests").value || Number($("o-guests").value) < menu.min) $("o-guests").value = menu.min;
    $("o-dishes").innerHTML = VGUI.dishChoices(menu);
    const minDate = VG.addDays(VG.todayIso(), menu.delay);
    $("o-date").min = minDate;
    if (!$("o-date").value || $("o-date").value < minDate) $("o-date").value = minDate;
    $("o-date-hint").textContent = `Au plus tôt le ${VG.formatDate(minDate)} (${menu.delay} jours avant la prestation).`;
    update();
  };

  // ---------- Récapitulatif ----------
  const update = () => {
    const menu = currentMenu();
    const guests = Math.max(0, parseInt($("o-guests").value, 10) || 0);
    const city = $("o-city").value.trim();
    const price = VG.computePrice(menu, guests, city);

    $("o-guests-hint").textContent = guests < menu.min
      ? `Minimum ${menu.min} personnes pour ce menu.`
      : `${guests} convives choisis.`;
    $("o-discount-info").textContent = price.discountRate
      ? `Remise de 10 % sur le menu appliquée (${guests} convives, à partir de ${menu.min + 5}). La livraison n'est pas concernée.`
      : `Remise de 10 % sur le menu à partir de ${menu.min + 5} convives (5 de plus que le minimum). La livraison n'est pas concernée.`;
    $("o-delivery-info").textContent = !city
      ? "Livraison offerte dans Bordeaux. Hors Bordeaux : 5 € + 0,59 € par kilomètre."
      : price.km
        ? `${city} : ${price.km} km depuis Bordeaux, soit 5 € + ${price.km} × 0,59 € = ${VG.euro(price.deliveryFee)}.`
        : "Livraison offerte dans Bordeaux.";

    const place = [$("o-street").value, `${$("o-zip").value} ${city}`].filter((x) => x.trim()).join(", ");
    $("o-recap").innerHTML = `
      <div><dt>Menu</dt><dd>${esc(menu.name)}</dd></div>
      <div><dt>Convives</dt><dd>${guests}</dd></div>
      <div><dt>Date</dt><dd>${VG.formatDate($("o-date").value)}</dd></div>
      <div><dt>Heure souhaitée</dt><dd>${esc($("o-time").value)}</dd></div>
      <div><dt>Lieu</dt><dd>${esc(place)}</dd></div>`;
    $("o-prices").innerHTML = guests >= menu.min ? VGUI.priceList(price, guests, menu.price / menu.min) : `<p class="small muted">Indiquez au moins ${menu.min} convives pour afficher le prix.</p>`;
  };

  select.addEventListener("change", setMenu);
  form.addEventListener("input", (e) => { if (e.target !== select) update(); });

  // ---------- Validation et création ----------
  const required = [
    ["o-lastname", "Saisissez votre nom."], ["o-firstname", "Saisissez votre prénom."], ["o-phone", "Saisissez votre numéro de GSM."],
    ["o-street", "Saisissez l'adresse de livraison."], ["o-zip", "Saisissez un code postal à 5 chiffres."], ["o-city", "Saisissez la ville de livraison."],
    ["o-date", "Choisissez la date de prestation."], ["o-time", "Choisissez l'heure souhaitée."],
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    const fail = (id, message) => { if (id) { $(id).setAttribute("aria-invalid", "true"); $(id).focus(); } VGUI.showError(error, message); };

    for (const [id, message] of required) {
      if (!$(id).value.trim() || !$(id).checkValidity()) return fail(id, message);
    }
    const menu = currentMenu();
    if ($("o-date").value < VG.addDays(VG.todayIso(), menu.delay)) return fail("o-date", `Ce menu doit être commandé au moins ${menu.delay} jours avant la prestation.`);
    const guests = parseInt($("o-guests").value, 10);
    if (!guests || guests < menu.min) return fail("o-guests", `Ce menu demande au moins ${menu.min} convives.`);
    const choice = VGUI.readDishChoices(form);
    if (choice.length < 3) return fail(null, "Choisissez une entrée, un plat et un dessert.");
    if (menu.stock <= 0) return fail("o-menu", "Ce menu n'est plus disponible.");

    error.hidden = true;
    const city = $("o-city").value.trim();
    const now = new Date().toISOString();
    const author = `${$("o-firstname").value.trim()} ${$("o-lastname").value.trim()}`;
    const order = {
      id: VG.nextOrderId(), menuId: menu.id, menuName: menu.name, perPerson: menu.price / menu.min, menuMin: menu.min,
      client: { firstName: $("o-firstname").value.trim(), lastName: $("o-lastname").value.trim(), email: user.email, phone: $("o-phone").value.trim() },
      accountAddress: { street: user.street, extra: user.extra || "", zip: user.zip, city: user.city },
      delivery: { street: $("o-street").value.trim(), extra: $("o-extra").value.trim(), zip: $("o-zip").value.trim(), city },
      date: $("o-date").value, time: $("o-time").value, guests,
      dishes: choice.map((id) => { const d = VG.dish(id); return { id: d.id, name: d.name, category: d.category, allergens: [...d.allergens] }; }),
      price: VG.computePrice(menu, guests, city), status: "en_attente",
      history: [{ status: "en_attente", at: now, author }],
      log: [{ at: now, author, action: "Création de la commande", detail: "Mail de confirmation envoyé au client", contact: "" }],
      createdAt: now, material: [], reviewId: null,
    };
    VG.data.orders.push(order);
    menu.stock -= 1;
    VG.save();

    $("order-form-block").hidden = true;
    $("oc-id").textContent = order.id;
    $("oc-total").textContent = VG.euro(order.price.total);
    $("oc-detail").setAttribute("href", `/account-order?id=${order.id}`);
    const confirmation = $("order-confirmation");
    confirmation.hidden = false;
    confirmation.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  setMenu();
})();
