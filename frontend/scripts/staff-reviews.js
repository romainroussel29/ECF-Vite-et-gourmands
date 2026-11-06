// Espace équipe : modération des avis (validation ou refus avec motif).
(() => {
  const list = document.getElementById("rv-list");
  if (!list) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const staff = VG.session.user();
  const author = staff ? VG.fullName(staff) : "Équipe";
  const LABELS = { en_attente: "En attente", valide: "Validés", refuse: "Refusés" };
  const BADGE = { en_attente: "En attente · non visible sur l'accueil", valide: "Validé · visible sur l'accueil", refuse: "Refusé · masqué sur l'accueil" };
  let tab = "en_attente";
  let confirming = null; // { id, action }

  const renderTabs = () => {
    const count = (s) => VG.data.reviews.filter((r) => r.status === s).length;
    $("rv-tabs").innerHTML = Object.entries(LABELS).map(([s, label]) =>
      `<button type="button" class="chip" data-tab="${s}" aria-pressed="${s === tab}">${label} · ${count(s)}</button>`).join("");
  };

  const render = () => {
    renderTabs();
    const q = VG.normalize($("rv-search").value);
    let reviews = VG.reviews().filter((r) => r.status === tab);
    if (q) reviews = reviews.filter((r) => VG.normalize(`${r.name} ${r.email} ${r.orderId}`).includes(q));
    const sort = $("rv-sort").value;
    if (sort === "desc") reviews.reverse();
    if (sort === "rating") reviews.sort((a, b) => a.rating - b.rating);

    $("rv-info").textContent = `${reviews.length} avis ${LABELS[tab].toLowerCase()} · seuls les avis issus de commandes terminées sont recevables. Notes de 1 à 5 et commentaire.`;

    list.innerHTML = reviews.length === 0
      ? `<p class="muted">Aucun avis dans cette file.</p>`
      : reviews.map((r) => {
        const isConfirm = confirming && confirming.id === r.id;
        let actions = "";
        if (r.status === "en_attente" && !isConfirm) {
          actions = `<div class="btn-row"><button type="button" class="btn-primary" data-ask="valider" data-id="${r.id}">Valider cet avis</button><button type="button" class="btn-secondary" data-ask="refuser" data-id="${r.id}">Refuser cet avis</button></div>`;
        } else if (isConfirm && confirming.action === "valider") {
          actions = `<div class="confirm-panel"><h3>Valider l'avis de ${esc(r.name)} ?</h3><p>Effet : En attente → Validé. L'avis sera affiché sur l'accueil public.</p>
            <div class="btn-row"><button type="button" class="btn-secondary" data-cancel>Annuler</button><button type="button" class="btn-primary" data-confirm="valider" data-id="${r.id}">Confirmer la validation</button></div></div>`;
        } else if (isConfirm && confirming.action === "refuser") {
          actions = `<div class="confirm-panel"><h3>Refuser l'avis de ${esc(r.name)} ?</h3>
            <div class="form-group"><label for="rv-reason">Motif de modération interne *</label><textarea id="rv-reason" rows="3"></textarea></div>
            <div class="notice danger" id="rv-error" role="alert" hidden></div>
            <p>Effet : En attente → Refusé. L'avis reste masqué sur l'accueil et conservé avec sa trace de modération.</p>
            <div class="btn-row"><button type="button" class="btn-secondary" data-cancel>Annuler</button><button type="button" class="btn-primary btn-danger" data-confirm="refuser" data-id="${r.id}">Confirmer le refus</button></div></div>`;
        }
        return `
          <article class="card review-card">
            <h3>${r.rating} / 5 · ${esc(r.name)}</h3>
            <p><span class="badge ${r.status}">${BADGE[r.status]}</span></p>
            <p class="small">${esc(r.orderId)} · Terminée · Avis du ${VG.formatDate(r.createdAt)}</p>
            <p class="review-quote">« ${esc(r.comment)} »</p>
            ${r.moderation ? `<p class="small muted">${r.status === "valide" ? "Validé" : "Refusé"} par ${esc(r.moderation.by)} le ${VG.formatDateTime(r.moderation.at)}${r.moderation.reason ? ` · Motif : ${esc(r.moderation.reason)}` : ""}</p>` : ""}
            ${actions}
          </article>`;
      }).join("");

    const published = VG.publishedReviews();
    $("rv-preview").innerHTML = published.length
      ? published.slice(0, 3).map((r) => `<p><strong>${r.rating} / 5 · ${esc(r.name)}</strong><br><span class="review-quote">« ${esc(r.comment)} »</span></p>`).join("")
      : `<p class="muted">Aucun avis validé pour le moment.</p>`;

    $("rv-reason")?.focus();
  };

  document.getElementById("page-staff-reviews").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; confirming = null; $("rv-flash").innerHTML = ""; return render(); }
    if (t.dataset.ask) { confirming = { id: t.dataset.id, action: t.dataset.ask }; return render(); }
    if (t.hasAttribute("data-cancel")) { confirming = null; return render(); }
    if (t.dataset.confirm) {
      const review = VG.data.reviews.find((r) => r.id === t.dataset.id);
      if (t.dataset.confirm === "refuser") {
        const reason = $("rv-reason").value.trim();
        if (!reason) return VGUI.showError($("rv-error"), "Indiquez le motif du refus.");
        review.status = "refuse";
        review.moderation = { by: author, at: new Date().toISOString(), reason };
      } else {
        review.status = "valide";
        review.moderation = { by: author, at: new Date().toISOString(), reason: "" };
      }
      VG.save();
      confirming = null;
      $("rv-flash").innerHTML = `<div class="notice success" role="status"><p>Avis de ${esc(review.name)} ${review.status === "valide" ? "validé : il est maintenant visible sur l'accueil" : "refusé : il reste masqué sur l'accueil"}.</p></div>`;
      render();
    }
  });
  $("rv-search").addEventListener("input", render);
  $("rv-sort").addEventListener("change", render);

  render();
})();
