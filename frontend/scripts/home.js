// Accueil : affiche les derniers avis validés par l'équipe.
(() => {
  const container = document.getElementById("home-reviews");
  if (!container) return;

  const esc = VG.escapeHtml;
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const reviews = VG.publishedReviews().slice(0, 3);

  if (reviews.length === 0) {
    container.innerHTML = `<p class="muted">Les avis de nos clients seront bientôt affichés ici.</p>`;
    return;
  }

  container.innerHTML = reviews.map((r) => {
    const d = new Date(r.createdAt);
    return `
      <div class="testimonial-card">
        <span class="testimonial-meta" aria-label="Note : ${r.rating} sur 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} · AVIS VÉRIFIÉ</span>
        <p class="testimonial-quote">« ${esc(r.comment)} »</p>
        <span class="testimonial-author">${esc(r.name)} • ${esc(r.event || "Prestation")} • ${months[d.getMonth()]} ${d.getFullYear()}</span>
      </div>`;
  }).join("");
})();
