// Espace équipe : liste des commandes, filtrée par client OU par statut.
(() => {
  const form = document.getElementById("so-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const statusSelect = $("so-status");
  Object.entries(VG.STATUS).forEach(([value, label]) => statusSelect.add(new Option(label, value)));

  // Le statut peut venir de l'URL (ex. /staff-orders?status=en_attente)
  const initialStatus = VG.param("status");
  if (initialStatus && VG.STATUS[initialStatus]) {
    form.querySelector('input[value="status"]').checked = true;
    statusSelect.value = initialStatus;
  }

  const mode = () => form.querySelector('input[name="so-mode"]:checked').value;
  const syncMode = () => {
    const byClient = mode() === "client";
    $("so-client").disabled = !byClient;
    statusSelect.disabled = byClient;
  };

  const render = () => {
    let orders = VG.orders();
    let label = "Toutes les commandes";
    if (mode() === "client") {
      const q = VG.normalize($("so-client").value);
      if (q) {
        orders = orders.filter((o) => VG.normalize(`${VG.fullName(o.client)} ${o.client.email}`).includes(q));
        label = `Client : ${esc($("so-client").value.trim())}`;
      }
    } else if (statusSelect.value) {
      orders = orders.filter((o) => o.status === statusSelect.value);
      label = `Statut : ${VG.STATUS[statusSelect.value]}`;
    }

    $("so-count").textContent = `Résultats · ${orders.length} commande${orders.length > 1 ? "s" : ""}`;
    $("so-active").innerHTML = `<span class="badge">Filtre actif · ${label}</span>`;
    $("so-body").innerHTML = orders.length === 0
      ? `<tr class="empty-row"><td colspan="5">Aucune commande ne correspond à cette recherche. Vérifiez le nom ou l'e-mail, ou réinitialisez la recherche.</td></tr>`
      : orders.map((o) => `
        <tr>
          <td><strong>${o.id}</strong><span class="cell-sub">${esc(o.menuName)}</span></td>
          <td>${esc(VG.fullName(o.client))}<span class="cell-sub">${esc(o.client.email)}</span></td>
          <td>${VG.formatDate(o.date)} · ${esc(o.time)}<span class="cell-sub">${o.guests} convives · ${esc(o.delivery.city)}</span></td>
          <td>${VG.euro(o.price.total)}</td>
          <td>${VGUI.statusBadge(o.status)}<br><a href="/staff-order?id=${o.id}">Ouvrir ${o.id} &rarr;</a></td>
        </tr>`).join("");
  };

  form.addEventListener("change", (e) => { if (e.target.name === "so-mode") syncMode(); render(); });
  $("so-client").addEventListener("input", render);
  form.addEventListener("submit", (e) => { e.preventDefault(); render(); });
  $("so-reset").addEventListener("click", () => { form.reset(); statusSelect.value = ""; syncMode(); render(); });

  syncMode();
  render();
})();
