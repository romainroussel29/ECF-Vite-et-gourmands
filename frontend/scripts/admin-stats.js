// Administration : statistiques des commandes terminées par menu et par période.
(() => {
  const form = document.getElementById("stats-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const year = new Date().getFullYear();
  const defaults = { from: `${year}-01-01`, to: `${year}-12-31` };

  // Menus présents dans les commandes (y compris menus retirés du catalogue)
  const menuNames = [...new Map(VG.data.orders.map((o) => [o.menuId, o.menuName])).entries()];
  VG.menus().forEach((m) => { if (!menuNames.some(([id]) => id === m.id)) menuNames.push([m.id, m.name]); });
  menuNames.forEach(([id, name]) => $("st-menu").add(new Option(name, id)));

  const setDefaults = () => { $("st-from").value = defaults.from; $("st-to").value = defaults.to; $("st-menu").value = ""; };

  const compute = () => {
    const from = $("st-from").value;
    const to = $("st-to").value;
    const menuId = $("st-menu").value;
    const selected = menuId ? menuNames.filter(([id]) => id === menuId) : menuNames;
    const done = VG.data.orders.filter((o) => o.status === "terminee" && o.date >= from && o.date <= to);

    const rows = selected.map(([id, name]) => {
      const list = done.filter((o) => o.menuId === id);
      return { name, count: list.length, ca: list.reduce((sum, o) => sum + o.price.subtotal, 0) };
    }).sort((a, b) => b.count - a.count);

    const total = rows.reduce((s, r) => ({ count: s.count + r.count, ca: s.ca + r.ca }), { count: 0, ca: 0 });
    const max = Math.max(1, ...rows.map((r) => r.count));
    const period = `du ${VG.formatDate(from)} au ${VG.formatDate(to)}`;

    $("stats-active").textContent = `Filtres affichés : ${menuId ? esc(selected[0][1]) : `${rows.length} menus`} · ${period}`;
    $("kpi-count").textContent = total.count;
    $("kpi-count-sub").textContent = `${rows.length} menu${rows.length > 1 ? "s" : ""} · uniquement terminées`;
    $("kpi-ca").textContent = VG.euro(total.ca);
    $("kpi-menus").textContent = rows.length;
    $("kpi-period").textContent = period;

    $("stats-chart").innerHTML = rows.map((r) => `
      <li>
        <div class="bar-label"><span>${esc(r.name)}</span><strong>${r.count}</strong></div>
        <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${(r.count / max) * 100}%"></div></div>
      </li>`).join("");
    $("stats-chart-text").textContent = `Lecture : ${rows.map((r) => `${r.name} ${r.count}`).join(", ")}. Total : ${total.count}. Les mêmes valeurs figurent dans le tableau ci-dessous.`;

    $("stats-table").innerHTML = rows.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.count}</td><td>${VG.euro(r.ca)}</td></tr>`).join("")
      + `<tr><td><strong>Total</strong></td><td><strong>${total.count}</strong></td><td><strong>${VG.euro(total.ca)}</strong></td></tr>`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("stats-error");
    ["st-from", "st-to"].forEach((id) => $(id).removeAttribute("aria-invalid"));
    if (!$("st-from").value || !$("st-to").value) return VGUI.showError(err, "Renseignez le début et la fin de la période.");
    if ($("st-to").value < $("st-from").value) {
      $("st-to").setAttribute("aria-invalid", "true");
      $("st-to").focus();
      return VGUI.showError(err, "La fin de période doit être postérieure ou égale au début. Les données affichées n'ont pas changé.");
    }
    err.hidden = true;
    compute();
  });
  $("stats-reset").addEventListener("click", () => {
    setDefaults();
    $("stats-error").hidden = true;
    ["st-from", "st-to"].forEach((id) => $(id).removeAttribute("aria-invalid"));
    compute();
  });

  setDefaults();
  compute();
})();
