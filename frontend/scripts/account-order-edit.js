// Espace client : modification d'une commande encore en attente.
// Le menu est verrouillé ; le prix est recalculé en direct.
(() => {
  const form = document.getElementById("edit-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const user = VG.session.user();
  const order = VG.order(VG.param("id") || "");
  $("account-nav").innerHTML = VGUI.accountNav("orders");

  if (!user || !order || VG.normalize(order.client.email) !== VG.normalize(user.email)) {
    $("oe-content").innerHTML = `<p>Cette commande n'existe pas ou n'est pas associée à votre compte.</p><p><a href="/account" class="btn-primary">Retour à mes commandes</a></p>`;
    return;
  }
  const detailUrl = `/account-order?id=${order.id}`;
  if (order.status !== "en_attente") {
    $("oe-content").innerHTML = `<div class="notice"><span class="notice-title">Modification indisponible</span><p>La commande ${order.id} est « ${VG.STATUS[order.status]} » : elle ne peut plus être modifiée.</p></div><p><a href="${detailUrl}" class="btn-primary">Voir le détail</a></p>`;
    return;
  }

  $("oe-title").textContent = `Modifier ${order.id}`;
  $("oe-back").setAttribute("href", detailUrl);
  $("oe-cancel").setAttribute("href", detailUrl);

  const menu = VG.menuById(order.menuId) || { id: order.menuId, name: order.menuName, min: order.menuMin, price: order.perPerson * order.menuMin, delay: 0, dishes: order.dishes.map((d) => d.id), storage: "" };
  const minDate = VG.addDays(VG.todayIso(), menu.delay);

  // Préremplissage avec les valeurs actuelles de la commande
  $("e-lastname").value = order.client.lastName;
  $("e-firstname").value = order.client.firstName;
  $("e-phone").value = order.client.phone;
  $("e-email").value = order.client.email;
  ["street", "extra", "zip", "city"].forEach((k) => ($(`e-${k}`).value = order.delivery[k] || ""));
  $("e-date").value = order.date;
  $("e-time").value = order.time;
  $("e-menu").value = order.menuName;
  $("e-menu-info").textContent = `${VG.euro(order.perPerson)}/personne · minimum ${order.menuMin} personnes.`;
  $("e-guests").min = order.menuMin;
  $("e-guests").value = order.guests;
  $("e-dishes").innerHTML = VGUI.dishChoices(menu, order.dishes.map((d) => d.id));
  $("e-date-hint").textContent = `Au moins ${menu.delay} jours avant la prestation.`;
  $("e-price-sub").textContent = `${order.menuName} · ${VG.euro(order.perPerson)}/personne`;
  if (menu.storage) $("e-conditions").innerHTML = VGUI.menuConditions(menu); else $("e-conditions").hidden = true;

  const update = () => {
    const guests = parseInt($("e-guests").value, 10) || 0;
    $("e-guests-hint").textContent = `Minimum ${order.menuMin}. Remise de 10 % dès ${order.menuMin + 5} convives, sur le menu hors livraison.`;
    $("e-prices").innerHTML = guests >= order.menuMin
      ? VGUI.priceList(VG.computePrice(menu, guests, $("e-city").value), guests, order.perPerson)
      : `<p class="small muted">Indiquez au moins ${order.menuMin} convives.</p>`;
  };
  form.addEventListener("input", update);
  update();

  const required = [
    ["e-lastname", "Saisissez votre nom."], ["e-firstname", "Saisissez votre prénom."], ["e-phone", "Saisissez votre numéro de GSM."],
    ["e-street", "Saisissez l'adresse de livraison."], ["e-zip", "Saisissez un code postal à 5 chiffres."], ["e-city", "Saisissez la ville."],
    ["e-date", "Choisissez la date de prestation."], ["e-time", "Choisissez l'heure souhaitée."],
  ];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("edit-error");
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    const fail = (id, message) => { if (id) { $(id).setAttribute("aria-invalid", "true"); $(id).focus(); } VGUI.showError(err, message); };

    // Contrôle du statut au moment de l'enregistrement
    if (order.status !== "en_attente") return fail(null, "Cette commande a été acceptée entre-temps : elle ne peut plus être modifiée.");
    for (const [id, message] of required) if (!$(id).value.trim() || !$(id).checkValidity()) return fail(id, message);
    if ($("e-date").value < minDate) return fail("e-date", `La prestation doit avoir lieu au moins ${menu.delay} jours après aujourd'hui.`);
    const guests = parseInt($("e-guests").value, 10);
    if (!guests || guests < order.menuMin) return fail("e-guests", `Ce menu demande au moins ${order.menuMin} convives.`);
    const choice = VGUI.readDishChoices(form);
    if (choice.length < 3) return fail(null, "Choisissez une entrée, un plat et un dessert.");

    order.client.lastName = $("e-lastname").value.trim();
    order.client.firstName = $("e-firstname").value.trim();
    order.client.phone = $("e-phone").value.trim();
    ["street", "extra", "zip", "city"].forEach((k) => (order.delivery[k] = $(`e-${k}`).value.trim()));
    order.date = $("e-date").value;
    order.time = $("e-time").value;
    order.guests = guests;
    order.dishes = choice.map((id) => { const d = VG.dish(id); return { id: d.id, name: d.name, category: d.category, allergens: [...d.allergens] }; });
    order.price = VG.computePrice(menu, guests, order.delivery.city);
    VG.addLog(order, { author: VG.fullName(order.client), action: "Modification par le client", detail: `${guests} convives · ${VG.formatDate(order.date)} ${order.time} · ${order.delivery.city}`, contact: "" });
    VG.save();
    navigateTo(detailUrl);
  });
})();
