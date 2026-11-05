// Espace client : liste de toutes les commandes du compte connecté.
(() => {
  const body = document.getElementById("orders-body");
  if (!body) return;

  const user = VG.session.user();
  if (!user) return;
  document.getElementById("account-nav").innerHTML = VGUI.accountNav("orders");

  const esc = VG.escapeHtml;
  const orders = VG.ordersOf(user.email);
  document.getElementById("orders-count").textContent = `${orders.length} commande${orders.length > 1 ? "s" : ""}`;

  if (orders.length === 0) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">Vous n'avez pas encore passé de commande. <a href="/menus">Découvrir nos menus</a></td></tr>`;
    return;
  }

  const actions = (o) => {
    const detail = `<a href="/account-order?id=${o.id}">Voir le détail &rarr;</a>`;
    if (o.status === "en_attente") return `${detail}<span class="cell-sub">Modifiable et annulable depuis le détail.</span>`;
    if (o.status === "terminee") {
      const review = o.reviewId ? VG.data.reviews.find((r) => r.id === o.reviewId) : null;
      return `${detail}<br>${review ? `<span class="cell-sub">Avis envoyé (${review.status === "valide" ? "publié" : review.status === "refuse" ? "non publié" : "en cours de validation"})</span>` : `<a href="/account-order?id=${o.id}#avis">Donner mon avis &rarr;</a>`}`;
    }
    if (o.status === "annulee") return detail;
    return `${detail}<br><a href="/account-order?id=${o.id}#suivi">Suivre ma commande &rarr;</a>`;
  };

  body.innerHTML = orders.map((o) => `
    <tr>
      <td><strong>${o.id}</strong><span class="cell-sub">${esc(o.menuName)}</span></td>
      <td>${VG.formatDate(o.date)}<span class="cell-sub">${esc(o.time)} · ${esc(o.delivery.city)}</span></td>
      <td>${o.guests}</td>
      <td>${VG.euro(o.price.total)}</td>
      <td>${VGUI.statusBadge(o.status)}</td>
      <td>${actions(o)}</td>
    </tr>`).join("");
})();
