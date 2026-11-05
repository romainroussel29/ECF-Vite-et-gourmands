// ==========================================================================
// STORE : données de l'application (menus, plats, commandes, avis, horaires,
// comptes) enregistrées dans le localStorage du navigateur.
// En attendant le back-end, toutes les pages lisent et écrivent ici via
// l'objet global window.VG. Chargé une seule fois dans index.html.
// ==========================================================================
(() => {
  const STORAGE_KEY = "vg-data-v1";

  // ---------- Libellés ----------
  const STATUS = {
    en_attente: "En attente",
    acceptee: "Acceptée",
    en_preparation: "En préparation",
    en_livraison: "En cours de livraison",
    livree: "Livrée",
    attente_materiel: "En attente du retour de matériel",
    terminee: "Terminée",
    annulee: "Annulée",
  };
  // Ordre du suivi (l'annulation est à part)
  const STATUS_FLOW = ["en_attente", "acceptee", "en_preparation", "en_livraison", "livree", "attente_materiel", "terminee"];

  const ROLE_LABELS = { client: "Utilisateur", employee: "Employé", admin: "Administrateur" };
  const CATEGORY_LABELS = { entree: "Entrée", plat: "Plat", dessert: "Dessert" };
  const MENU_STATUS = { brouillon: "Brouillon", publie: "Publié", archive: "Archivé" };
  const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const ALLERGENS = ["Gluten", "Crustacés", "Œufs", "Poisson", "Arachides", "Soja", "Lait", "Fruits à coque", "Céleri", "Moutarde", "Sésame", "Sulfites", "Lupin", "Mollusques"];
  const IMAGES = ["table_saison.jpg", "tarte_tomate.jpg", "poulet_roti.webp", "jardin_vegetal.jpg", "Reception_conviviale.png", "Festin_noel.png", "photo_de_presentation.jpg", "presentation_de_lequipe.jpg"];

  // Distances depuis Bordeaux (km) pour le calcul de la livraison
  const DISTANCES = {
    "merignac": 20, "pessac": 12, "talence": 8, "begles": 7, "le bouscat": 6, "bruges": 8,
    "cenon": 6, "lormont": 9, "floirac": 7, "villenave-d'ornon": 11, "gradignan": 13,
    "eysines": 12, "blanquefort": 15, "saint-medard-en-jalles": 20, "le haillan": 14,
    "libourne": 35, "arcachon": 65, "andernos-les-bains": 50, "saint-emilion": 40,
  };
  const DEFAULT_DISTANCE = 20;
  const MATERIAL_PENALTY = 600;
  const MATERIAL_DAYS = 10;

  // ---------- Outils ----------
  const normalize = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const pad = (n) => String(n).padStart(2, "0");
  const euro = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const formatDate = (iso) => { if (!iso) return ""; const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}/${m}/${y}`; };
  const formatDateTime = (iso) => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const addDays = (iso, days) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const escapeHtml = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (t) => normalize(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const param = (name) => new URLSearchParams(window.location.search).get(name);

  // Jours ouvrés (lundi à vendredi) écoulés entre deux dates
  const workingDaysBetween = (fromIso, toIso) => {
    let count = 0;
    const d = new Date(fromIso.slice(0, 10) + "T12:00:00");
    const end = new Date(toIso.slice(0, 10) + "T12:00:00");
    while (d < end) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) count++; }
    return count;
  };

  // ---------- Données initiales ----------
  const seed = () => {
    const dishes = [
      { id: "d1", name: "Tarte fine tomate et chèvre", category: "entree", allergens: ["Gluten", "Lait"] },
      { id: "d2", name: "Salade de lentilles", category: "entree", allergens: ["Moutarde"] },
      { id: "d3", name: "Poulet rôti, jus aux herbes", category: "plat", allergens: ["Lait"] },
      { id: "d4", name: "Filet de lieu au citron", category: "plat", allergens: ["Poisson", "Lait"] },
      { id: "d5", name: "Tarte aux pommes", category: "dessert", allergens: ["Gluten", "Œufs", "Lait"] },
      { id: "d6", name: "Mousse au chocolat", category: "dessert", allergens: ["Œufs", "Lait"] },
      { id: "d7", name: "Velouté de petits pois à la menthe", category: "entree", allergens: ["Céleri"] },
      { id: "d8", name: "Houmous de betterave et crudités", category: "entree", allergens: ["Sésame"] },
      { id: "d9", name: "Risotto d'épeautre aux asperges", category: "plat", allergens: ["Gluten"] },
      { id: "d10", name: "Curry de pois chiches et légumes printaniers", category: "plat", allergens: [] },
      { id: "d11", name: "Salade de fraises à la menthe", category: "dessert", allergens: [] },
      { id: "d12", name: "Crumble rhubarbe et pomme", category: "dessert", allergens: ["Gluten", "Fruits à coque"] },
      { id: "d13", name: "Verrines de légumes et fromage frais", category: "entree", allergens: ["Lait"] },
      { id: "d14", name: "Mini-quiches aux légumes", category: "entree", allergens: ["Gluten", "Œufs", "Lait"] },
      { id: "d15", name: "Lasagnes aux légumes grillés", category: "plat", allergens: ["Gluten", "Lait"] },
      { id: "d16", name: "Gratin de pommes de terre et champignons", category: "plat", allergens: ["Lait"] },
      { id: "d17", name: "Assortiment de mignardises", category: "dessert", allergens: ["Gluten", "Œufs", "Lait", "Fruits à coque"] },
      { id: "d18", name: "Salade de fruits frais", category: "dessert", allergens: [] },
      { id: "d19", name: "Foie gras et chutney de figues", category: "entree", allergens: ["Gluten"] },
      { id: "d20", name: "Saumon fumé et blinis", category: "entree", allergens: ["Poisson", "Gluten", "Œufs", "Lait"] },
      { id: "d21", name: "Chapon farci aux marrons", category: "plat", allergens: ["Lait", "Céleri"] },
      { id: "d22", name: "Dos de cabillaud, beurre blanc", category: "plat", allergens: ["Poisson", "Lait"] },
      { id: "d23", name: "Bûche chocolat et marron", category: "dessert", allergens: ["Gluten", "Œufs", "Lait"] },
      { id: "d24", name: "Bûche glacée aux fruits rouges", category: "dessert", allergens: ["Œufs", "Lait"] },
      { id: "d25", name: "Velouté de courge", category: "entree", allergens: ["Céleri"] },
    ];

    const storage = "Conserver entre 0 et +4 °C et consommer dans les 24 heures suivant la livraison. Ne pas rompre la chaîne du froid.";
    const menus = [
      {
        id: "m1", slug: "table-de-saison", name: "Table de saison", theme: "Classique", diet: "Classique", otherDiet: "",
        desc: "Une cuisine de saison, entre recettes du terroir et desserts maison, pour vos repas partagés.",
        price: 320, min: 10, stock: 5, delay: 7, status: "publie", visible: true, order: 1, storage,
        conditions: "Demande à confirmer selon le stock disponible. Modalités de prestation et d'annulation : voir les CGV.",
        images: [
          { file: "table_saison.jpg", alt: "Assiette de saison avec légumes rôtis et volaille" },
          { file: "tarte_tomate.jpg", alt: "Tarte fine à la tomate et au chèvre" },
          { file: "poulet_roti.webp", alt: "Poulet rôti et accompagnement de saison" },
        ],
        dishes: ["d1", "d2", "d3", "d4", "d5", "d6"],
      },
      {
        id: "m2", slug: "jardin-vegetal", name: "Jardin végétal", theme: "Pâques", diet: "Vegan", otherDiet: "",
        desc: "Des légumes printaniers, des céréales et des desserts fruités pour une table entièrement végétale.",
        price: 256, min: 8, stock: 3, delay: 7, status: "publie", visible: true, order: 2, storage,
        conditions: "Demande à confirmer selon le stock disponible. Modalités de prestation et d'annulation : voir les CGV.",
        images: [{ file: "jardin_vegetal.jpg", alt: "Assortiment de plats végétaux printaniers" }],
        dishes: ["d7", "d8", "d9", "d10", "d11", "d12"],
      },
      {
        id: "m3", slug: "reception-conviviale", name: "Réception conviviale", theme: "Événement", diet: "Végétarien", otherDiet: "",
        desc: "Un buffet généreux et entièrement végétarien, pensé pour les grandes tablées et les événements d'entreprise.",
        price: 580, min: 20, stock: 6, delay: 10, status: "publie", visible: true, order: 3, storage,
        conditions: "Demande à confirmer selon le stock disponible. Modalités de prestation et d'annulation : voir les CGV.",
        images: [{ file: "Reception_conviviale.png", alt: "Buffet de réception avec plats à partager" }],
        dishes: ["d13", "d14", "d15", "d16", "d17", "d18"],
      },
      {
        id: "m4", slug: "festin-de-noel", name: "Festin de Noël", theme: "Noël", diet: "Classique", otherDiet: "",
        desc: "Un repas de fête traditionnel, du foie gras à la bûche, pour célébrer la fin d'année ensemble.",
        price: 540, min: 12, stock: 2, delay: 14, status: "publie", visible: true, order: 4, storage,
        conditions: "Demande à confirmer selon le stock disponible. Modalités de prestation et d'annulation : voir les CGV.",
        images: [{ file: "Festin_noel.png", alt: "Table de fête dressée pour le repas de Noël" }],
        dishes: ["d19", "d20", "d21", "d22", "d23", "d24"],
      },
    ];

    const camille = { firstName: "Camille", lastName: "Martin", email: "camille.martin@example.com", phone: "06 12 34 56 78", street: "24 rue des Lilas", extra: "Bâtiment A", zip: "33000", city: "Bordeaux" };
    const accounts = [
      { ...camille, password: "Gourmand2026!", role: "client", active: true, createdAt: "2026-01-12T10:00:00" },
      { firstName: "Julie", lastName: "Moreau", email: "julie@vite-et-gourmands.fr", phone: "05 56 00 00 01", street: "12 rue Sainte-Catherine", extra: "", zip: "33000", city: "Bordeaux", password: "Employe2026!", role: "employee", active: true, createdAt: "2026-01-01T09:00:00" },
      { firstName: "José", lastName: "Garcia", email: "jose@vite-et-gourmands.fr", phone: "05 56 00 00 02", street: "12 rue Sainte-Catherine", extra: "", zip: "33000", city: "Bordeaux", password: "Admin2026!", role: "admin", active: true, createdAt: "2026-01-01T09:00:00" },
      { firstName: "Lucas", lastName: "Bernard", email: "lucas.bernard@vite-et-gourmands.fr", phone: "05 56 00 00 03", street: "", extra: "", zip: "", city: "", password: "Renfort2026!", role: "employee", active: false, createdAt: "2026-03-02T09:00:00", deactivatedAt: "2026-06-30T18:00:00", deactivationReason: "Fin de contrat saisonnier" },
    ];

    const delivery = { street: "18 avenue de la République", extra: "Bâtiment principal", zip: "33700", city: "Mérignac" };
    const hist = (entries) => entries.map(([status, at, author]) => ({ status, at, author }));
    const orders = [];
    // Dates relatives au jour du premier chargement
    const T = todayIso();
    const day = (offset, time = "10:00") => `${addDays(T, offset)}T${time}:00`;

    // Commandes de Camille Martin : en attente, acceptée, terminée
    orders.push(makeOrder({ id: "MB-1042", menu: menus[0], dishes, client: camille, delivery, date: addDays(T, 20), time: "12:30", guests: 15, choice: ["d1", "d3", "d5"], createdAt: day(-2, "10:15"),
      history: hist([["en_attente", day(-2, "10:15"), "Camille Martin"]]) }));
    orders.push(makeOrder({ id: "MB-1038", menu: menus[0], dishes, client: camille, delivery, date: addDays(T, 12), time: "12:30", guests: 20, choice: ["d2", "d3", "d6"], createdAt: day(-6, "10:15"),
      history: hist([["en_attente", day(-6, "10:15"), "Camille Martin"], ["acceptee", day(-5, "09:20"), "Julie Moreau"]]) }));
    orders.push(makeOrder({ id: "MB-1024", menu: menus[0], dishes, client: camille, delivery, date: addDays(T, -20), time: "12:30", guests: 10, choice: ["d1", "d3", "d5"], createdAt: day(-30, "10:15"),
      history: hist([["en_attente", day(-30, "10:15"), "Camille Martin"], ["acceptee", day(-29, "09:20"), "Julie Moreau"], ["en_preparation", day(-20, "08:00"), "Julie Moreau"],
        ["en_livraison", day(-20, "11:45"), "José Garcia"], ["livree", day(-20, "12:30"), "José Garcia"], ["attente_materiel", day(-20, "12:35"), "José Garcia"], ["terminee", day(-18, "14:00"), "Julie Moreau"]]),
      material: [{ name: "Bacs isothermes", lent: 2, returned: 2 }, { name: "Plateaux de service", lent: 6, returned: 6 }] }));

    // Commande livrée dont le matériel prêté n'est pas encore rendu (délai dépassé)
    const thomas = { firstName: "Thomas", lastName: "Leroy", email: "thomas.leroy@example.com", phone: "06 22 33 44 55", street: "5 cours de l'Intendance", extra: "", zip: "33000", city: "Bordeaux" };
    orders.push(makeOrder({ id: "MB-1040", menu: menus[2], dishes, client: thomas, delivery: { street: "40 avenue Thiers", extra: "Salle de réception", zip: "33100", city: "Bordeaux" }, date: addDays(T, -16), time: "19:00", guests: 20, choice: ["d13", "d15", "d17"], createdAt: day(-30, "15:00"),
      history: hist([["en_attente", day(-30, "15:00"), "Thomas Leroy"], ["acceptee", day(-29, "09:00"), "Julie Moreau"], ["en_preparation", day(-16, "14:00"), "Julie Moreau"],
        ["en_livraison", day(-16, "18:00"), "José Garcia"], ["livree", day(-16, "18:45"), "José Garcia"], ["attente_materiel", day(-16, "18:50"), "José Garcia"]]),
      material: [{ name: "Bacs isothermes", lent: 2, returned: 0 }, { name: "Plateaux de service", lent: 6, returned: 2 }] }));
    orders[orders.length - 1].log.unshift({ at: day(-16, "18:50"), author: "Système", action: "Mail de restitution envoyé", detail: "Restitution sous 10 jours ouvrés, pénalité de 600 € au-delà", contact: "" });

    // Historique de commandes terminées (statistiques)
    const others = [
      ["Sophie", "Dubois"], ["Hugo", "Petit"], ["Emma", "Roux"], ["Nathan", "Fournier"], ["Léa", "Girard"], ["Louis", "Bonnet"],
      ["Chloé", "Lambert"], ["Jules", "Fontaine"], ["Manon", "Rousseau"], ["Paul", "Vincent"],
    ];
    const plan = [[0, 12], [1, 8], [2, 6], [3, 4]];
    let num = 900;
    plan.forEach(([mi, count]) => {
      for (let i = 0; i < count; i++) {
        const [firstName, lastName] = others[(num + i) % others.length];
        const client = { firstName, lastName, email: `${normalize(firstName)}.${normalize(lastName)}@example.com`, phone: "06 00 00 00 00", street: "1 place de la Bourse", extra: "", zip: "33000", city: "Bordeaux" };
        const offset = -(25 + (num - 900) * 6);
        const date = addDays(T, offset);
        const menu = menus[mi];
        const ids = menu.dishes;
        orders.push(makeOrder({ id: `MB-${num++}`, menu, dishes, client, delivery: { street: "1 place de la Bourse", extra: "", zip: "33000", city: "Bordeaux" }, date, time: "12:00",
          guests: menu.min + (i % 3 === 0 ? 5 : 0), choice: [ids[0], ids[2], ids[4]], createdAt: day(offset - 12),
          history: hist([["en_attente", day(offset - 12), `${firstName} ${lastName}`], ["acceptee", day(offset - 11, "09:00"), "Julie Moreau"], ["terminee", day(offset, "16:00"), "Julie Moreau"]]) }));
      }
    });

    const reviews = [
      { id: "r1", orderId: "MB-905", email: "emma.roux@example.com", name: "Emma R.", rating: 5, comment: "Une équipe attentive et un repas apprécié par tous nos invités.", status: "valide", createdAt: day(-40), event: "Réception privée" },
      { id: "r2", orderId: "MB-913", email: "hugo.petit@example.com", name: "Hugo P.", rating: 4, comment: "Des échanges clairs et un buffet adapté à notre déjeuner d'équipe.", status: "valide", createdAt: day(-60), event: "Repas d'entreprise" },
      { id: "r3", orderId: "MB-920", email: "sophie.dubois@example.com", name: "Sophie D.", rating: 5, comment: "Un buffet soigné et des échanges très clairs avant la prestation.", status: "en_attente", createdAt: day(-3), event: "Réception" },
      { id: "r4", orderId: "MB-922", email: "louis.bonnet@example.com", name: "Louis B.", rating: 3, comment: "Le repas était bon, mais nous aurions apprécié davantage de précisions sur le retour des plateaux.", status: "en_attente", createdAt: day(-2), event: "Réception" },
      { id: "r5", orderId: "MB-926", email: "nathan.fournier@example.com", name: "Nathan F.", rating: 2, comment: "Livraison en retard de quarante minutes.", status: "refuse", createdAt: day(-8), event: "Repas d'équipe", moderation: { by: "Julie Moreau", at: day(-7, "09:00"), reason: "Retard déjà traité directement avec le client" } },
    ];
    // Les commandes ayant reçu un avis le savent
    reviews.forEach((r) => { const o = orders.find((x) => x.id === r.orderId); if (o) o.reviewId = r.id; });

    const hours = DAYS.map((day, i) => i === 0
      ? { day, closed: true, ranges: [] }
      : { day, closed: false, ranges: [{ open: "10:00", close: "15:00" }, { open: "18:00", close: "00:00" }] });

    return { version: 1, menus, dishes, orders, reviews, hours, accounts, counter: 1043 };
  };

  // ---------- Prix ----------
  const deliveryDistance = (city) => {
    const key = normalize(city);
    if (!key || key === "bordeaux") return 0;
    return DISTANCES[key] ?? DEFAULT_DISTANCE;
  };

  const computePrice = (menu, guests, city) => {
    const perPerson = menu.price / menu.min;
    const base = Math.round(perPerson * guests * 100) / 100;
    const discountRate = guests >= menu.min + 5 ? 0.1 : 0;
    const discount = Math.round(base * discountRate * 100) / 100;
    const km = deliveryDistance(city);
    const deliveryFee = km === 0 ? 0 : Math.round((5 + 0.59 * km) * 100) / 100;
    const total = Math.round((base - discount + deliveryFee) * 100) / 100;
    return { perPerson, base, discountRate, discount, subtotal: base - discount, km, deliveryFee, total };
  };

  function makeOrder({ id, menu, dishes, client, delivery, date, time, guests, choice, createdAt, history, material }) {
    const pick = (cid) => { const d = dishes.find((x) => x.id === cid); return { id: d.id, name: d.name, category: d.category, allergens: [...d.allergens] }; };
    return {
      id, menuId: menu.id, menuName: menu.name, perPerson: menu.price / menu.min, menuMin: menu.min,
      client: { firstName: client.firstName, lastName: client.lastName, email: client.email, phone: client.phone },
      accountAddress: { street: client.street, extra: client.extra, zip: client.zip, city: client.city },
      delivery: { ...delivery }, date, time, guests, dishes: choice.map(pick),
      price: computePrice(menu, guests, delivery.city), status: history[history.length - 1].status,
      history, log: [], createdAt, material: material || [], reviewId: null,
    };
  }

  // ---------- Persistance ----------
  let data;
  const load = () => {
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { data = null; }
    if (!data || data.version !== 1) { data = seed(); save(); }
  };
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };

  // ---------- Session ----------
  const session = {
    user: () => {
      const email = localStorage.getItem("userEmail");
      return email ? data.accounts.find((a) => a.email === email && a.active) || null : null;
    },
    role: () => localStorage.getItem("userRole") || "visitor",
    login: (email, password) => {
      const account = data.accounts.find((a) => normalize(a.email) === normalize(email));
      if (!account || account.password !== password) return { ok: false, error: "Adresse mail ou mot de passe incorrect." };
      if (!account.active) return { ok: false, error: "Ce compte a été désactivé. Contactez l'administrateur." };
      localStorage.setItem("userRole", account.role);
      localStorage.setItem("userEmail", account.email);
      return { ok: true, account };
    },
    logout: () => { localStorage.removeItem("userRole"); localStorage.removeItem("userEmail"); },
    homeFor: (role) => (role === "client" ? "/account" : role === "employee" || role === "admin" ? "/staff-orders" : "/"),
  };

  const fullName = (p) => `${p.firstName} ${p.lastName}`;

  // ---------- API ----------
  const VG = {
    STATUS, STATUS_FLOW, ROLE_LABELS, CATEGORY_LABELS, MENU_STATUS, DAYS, ALLERGENS, IMAGES, MATERIAL_PENALTY, MATERIAL_DAYS,
    normalize, euro, formatDate, formatDateTime, todayIso, addDays, escapeHtml, slugify, param, workingDaysBetween, fullName,
    session, computePrice, deliveryDistance,
    get data() { return data; },
    save,
    reset: () => { data = seed(); save(); },

    // Menus & plats
    menus: () => [...data.menus].sort((a, b) => a.order - b.order),
    publicMenus: () => VG.menus().filter((m) => m.status === "publie" && m.visible),
    menuById: (id) => data.menus.find((m) => m.id === id),
    menuBySlug: (slug) => data.menus.find((m) => m.slug === slug),
    dish: (id) => data.dishes.find((d) => d.id === id),
    menuDishes: (menu) => menu.dishes.map(VG.dish).filter(Boolean),
    menusUsingDish: (id) => data.menus.filter((m) => m.dishes.includes(id)),

    // Commandes
    orders: () => [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    order: (id) => data.orders.find((o) => o.id === id),
    ordersOf: (email) => VG.orders().filter((o) => normalize(o.client.email) === normalize(email)),
    nextOrderId: () => `MB-${data.counter++}`,
    statusAt: (order, status) => order.history.find((h) => h.status === status),

    addLog: (order, entry) => { order.log.unshift({ at: new Date().toISOString(), ...entry }); },
    setStatus: (order, status, author, extra = {}) => {
      const previous = order.status;
      order.status = status;
      order.history.push({ status, at: new Date().toISOString(), author, ...extra });
      VG.addLog(order, { author, action: `${STATUS[previous]} → ${STATUS[status]}`, detail: extra.reason || "", contact: extra.contact || "" });
      // Retour au stock si la commande est annulée
      if (status === "annulee") { const m = VG.menuById(order.menuId); if (m) m.stock += 1; }
    },

    // Avis
    reviews: () => [...data.reviews].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    publishedReviews: () => VG.reviews().filter((r) => r.status === "valide").reverse(),

    // Comptes
    account: (email) => data.accounts.find((a) => normalize(a.email) === normalize(email)),

    // Horaires
    hoursText: (h) => (h.closed || h.ranges.length === 0 ? "Fermé" : h.ranges.map((r) => `${r.open.replace(":00", "h")}-${r.close.replace(":00", "h")}`).join("  ")),
    renderFooterHours: () => {
      const list = document.querySelector(".site-footer .hours-list");
      if (!list) return;
      list.innerHTML = data.hours.map((h) => `<li><span>${h.day}</span> <span>${escapeHtml(VG.hoursText(h))}</span></li>`).join("");
    },
  };

  load();
  window.VG = VG;
  VG.renderFooterHours();
})();
