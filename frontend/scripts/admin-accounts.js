// Administration : création et désactivation des comptes Employé.
(() => {
  const form = document.getElementById("ac-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const esc = VG.escapeHtml;
  const admin = VG.session.user();
  const author = admin ? VG.fullName(admin) : "Administrateur";
  const employees = () => VG.data.accounts.filter((a) => a.role === "employee");

  const rules = {
    length: (v) => v.length >= 10, case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    digit: (v) => /\d/.test(v), special: (v) => /[^A-Za-z0-9]/.test(v),
  };
  const checkRules = () => {
    let ok = true;
    document.querySelectorAll("#ac-rules li").forEach((li) => {
      const valid = rules[li.dataset.rule]($("ac-password").value);
      li.classList.toggle("is-valid", valid);
      if (!valid) ok = false;
    });
    return ok;
  };

  const flash = (message) => {
    $("ac-flash").innerHTML = `<div class="notice success" role="status"><p>${message}</p></div>`;
    $("ac-flash").scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const render = () => {
    const q = VG.normalize($("ac-search").value);
    const state = $("ac-state").value;
    const list = employees().filter((a) => (!q || VG.normalize(`${a.email} ${VG.fullName(a)}`).includes(q))
      && (!state || (state === "active" ? a.active : !a.active)));
    $("ac-title").textContent = `Comptes employés · ${list.length} résultat${list.length > 1 ? "s" : ""}`;
    $("ac-body").innerHTML = list.length === 0
      ? `<tr class="empty-row"><td colspan="4">Aucun compte ne correspond.</td></tr>`
      : list.map((a) => `
        <tr>
          <td>${esc(a.email)}<span class="cell-sub">${esc(VG.fullName(a))} · créé le ${VG.formatDate(a.createdAt)}</span></td>
          <td>Employé</td>
          <td><span class="badge ${a.active ? "valide" : "inactif"}">${a.active ? "Actif" : "Inactif"}</span>${a.active ? "" : `<span class="cell-sub">Depuis le ${VG.formatDate(a.deactivatedAt)} · ${esc(a.deactivationReason || "")}</span>`}</td>
          <td>${a.active ? `<button type="button" class="link-btn danger" data-deactivate="${esc(a.email)}">Désactiver</button>` : `<button type="button" class="link-btn" data-reactivate="${esc(a.email)}">Réactiver</button>`}</td>
        </tr>`).join("");
  };

  document.getElementById("page-admin-accounts").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.deactivate) {
      const a = VG.account(t.dataset.deactivate);
      $("ac-panel").innerHTML = `
        <div class="confirm-panel" tabindex="-1">
          <h3>Désactiver ${esc(a.email)} ?</h3>
          <p>Le compte deviendra inactif : la connexion sera refusée. Les actions passées restent attribuées à leur auteur dans les journaux.</p>
          <div class="form-group"><label for="ac-reason">Motif de désactivation *</label><input type="text" id="ac-reason" placeholder="Ex : départ de l'entreprise" /></div>
          <div class="notice danger" id="ac-reason-error" role="alert" hidden></div>
          <div class="btn-row">
            <button type="button" class="btn-secondary" data-panel-close>Annuler</button>
            <button type="button" class="btn-primary btn-danger" data-confirm-deactivate="${esc(a.email)}">Confirmer la désactivation</button>
          </div>
        </div>`;
      $("ac-reason").focus();
    }
    if (t.hasAttribute("data-panel-close")) $("ac-panel").innerHTML = "";
    if (t.dataset.confirmDeactivate) {
      const reason = $("ac-reason").value.trim();
      if (!reason) return VGUI.showError($("ac-reason-error"), "Indiquez le motif de désactivation.");
      const a = VG.account(t.dataset.confirmDeactivate);
      Object.assign(a, { active: false, deactivatedAt: new Date().toISOString(), deactivationReason: reason, deactivatedBy: author });
      VG.save();
      $("ac-panel").innerHTML = "";
      render();
      flash(`Compte ${esc(a.email)} désactivé : l'accès est révoqué.`);
    }
    if (t.dataset.reactivate) {
      const a = VG.account(t.dataset.reactivate);
      Object.assign(a, { active: true, deactivatedAt: null, deactivationReason: "" });
      VG.save();
      render();
      flash(`Compte ${esc(a.email)} réactivé.`);
    }
  });

  $("ac-password").addEventListener("input", checkRules);
  $("ac-search").addEventListener("input", render);
  $("ac-state").addEventListener("change", render);
  form.addEventListener("reset", () => setTimeout(() => { checkRules(); $("ac-error").hidden = true; }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("ac-error");
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    const fail = (id, message) => { $(id).setAttribute("aria-invalid", "true"); $(id).focus(); VGUI.showError(err, message); };
    if (!$("ac-firstname").value.trim()) return fail("ac-firstname", "Saisissez le prénom.");
    if (!$("ac-lastname").value.trim()) return fail("ac-lastname", "Saisissez le nom.");
    const email = $("ac-email").value.trim();
    if (!email || !$("ac-email").checkValidity()) return fail("ac-email", "Saisissez une adresse mail valide.");
    if (VG.account(email)) return fail("ac-email", "Cet identifiant existe déjà. Saisissez une autre adresse.");
    if (!checkRules()) return fail("ac-password", "Le mot de passe doit contenir 10 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial.");

    VG.data.accounts.push({
      firstName: $("ac-firstname").value.trim(), lastName: $("ac-lastname").value.trim(), email,
      phone: "", street: "", extra: "", zip: "", city: "", password: $("ac-password").value,
      role: "employee", active: true, createdAt: new Date().toISOString(), createdBy: author,
    });
    VG.save();
    form.reset();
    err.hidden = true;
    render();
    flash(`Compte Employé ${esc(email)} créé et actif. Un mail de bienvenue (sans mot de passe) lui a été envoyé.`);
  });

  render();
})();
