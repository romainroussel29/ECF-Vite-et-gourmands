// Filtres et tri de la page « Nos menus ».
// Script classique rechargé à chaque visite de la page : tout est encapsulé
// dans une IIFE pour ne pas redéclarer de variables globales.
(() => {
  const form = document.getElementById("menu-filters");
  const list = document.getElementById("menu-list");
  if (!form || !list) return;

  const fields = {
    search: document.getElementById("filter-search"),
    theme: document.getElementById("filter-theme"),
    diet: document.getElementById("filter-diet"),
    priceMax: document.getElementById("filter-price-max"),
    priceRange: document.getElementById("filter-price-range"),
    guests: document.getElementById("filter-guests"),
    sort: document.getElementById("filter-sort"),
  };
  const countEl = document.getElementById("results-count");
  const summaryEl = document.getElementById("filter-summary");
  const emptyEl = document.getElementById("menus-empty");
  const resetBtn = document.getElementById("filter-reset");
  const cards = Array.from(list.querySelectorAll(".menu-card"));

  // Comparaison sans accents ni majuscules (« noel » trouve « Noël »)
  const normalize = (text) =>
    text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  const readNumber = (input) => {
    const value = parseFloat(input.value);
    return Number.isFinite(value) ? value : null;
  };

  const readRange = () => {
    if (!fields.priceRange.value) return null;
    const [min, max] = fields.priceRange.value.split("-");
    return { min: min ? Number(min) : 0, max: max ? Number(max) : Infinity };
  };

  const matches = (card, filters) => {
    const { name, theme, diet } = card.dataset;
    const price = Number(card.dataset.price);
    const min = Number(card.dataset.min);
    const text = normalize(name + " " + card.querySelector(".menu-desc").textContent);

    if (filters.search && !text.includes(filters.search)) return false;
    if (filters.theme && theme !== filters.theme) return false;
    if (filters.diet && diet !== filters.diet) return false;
    if (filters.priceMax !== null && price > filters.priceMax) return false;
    if (filters.range && (price < filters.range.min || price > filters.range.max)) return false;
    if (filters.guests !== null && min > filters.guests) return false;
    return true;
  };

  const sorters = {
    default: (a, b) => a.dataset.order - b.dataset.order,
    "price-asc": (a, b) => a.dataset.price - b.dataset.price,
    "price-desc": (a, b) => b.dataset.price - a.dataset.price,
    "guests-asc": (a, b) => a.dataset.min - b.dataset.min,
  };

  const buildSummary = (filters, count) => {
    const parts = [];
    if (filters.search) parts.push(`recherche « ${fields.search.value.trim()} »`);
    if (filters.theme) parts.push(filters.theme);
    if (filters.diet) parts.push(filters.diet);
    if (filters.priceMax !== null) parts.push(`total TTC jusqu'à ${filters.priceMax} €`);
    if (filters.range) {
      const label = fields.priceRange.selectedOptions[0].textContent;
      parts.push(label.charAt(0).toLowerCase() + label.slice(1));
    }
    if (filters.guests !== null) parts.push(`minimum requis inférieur ou égal à ${filters.guests} personnes`);

    if (parts.length === 0) return "Aucun filtre actif : tous les menus sont affichés.";
    const label = count > 1 ? "résultats" : "résultat";
    return `${count} ${label} : ${parts.join(" · ")}.`;
  };

  const update = () => {
    const filters = {
      search: normalize(fields.search.value),
      theme: fields.theme.value,
      diet: fields.diet.value,
      priceMax: readNumber(fields.priceMax),
      range: readRange(),
      guests: readNumber(fields.guests),
    };

    // Tri puis réinsertion des cartes dans le bon ordre
    const sorter = sorters[fields.sort.value] || sorters.default;
    cards.slice().sort(sorter).forEach((card) => list.appendChild(card));

    let visible = 0;
    cards.forEach((card) => {
      const show = matches(card, filters);
      card.hidden = !show;
      if (show) visible++;
    });

    countEl.textContent =
      visible > 1 ? `${visible} menus correspondant aux filtres`
      : visible === 1 ? "1 menu correspondant aux filtres"
      : "Aucun menu correspondant aux filtres";
    emptyEl.hidden = visible !== 0;
    summaryEl.textContent = buildSummary(filters, visible);
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (e) => e.preventDefault());
  fields.sort.addEventListener("change", update);
  resetBtn.addEventListener("click", () => {
    form.reset();
    fields.sort.value = "default";
    update();
  });

  update();
})();
