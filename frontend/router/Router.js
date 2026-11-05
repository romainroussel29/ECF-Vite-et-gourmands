import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Routes de secours
const route404 = new Route("404", "Page introuvable", "/frontend/pages/public/404.html");
const route403 = new Route("403", "Accès refusé", "/frontend/pages/public/403.html");

// Recherche de la route associée à l'URL (ancre ignorée).
// Une route terminée par « * » accepte toutes les URL qui commencent pareil
// (ex. « /menu-* » pour les pages de détail des menus).
const getRouteByUrl = (url) => {
  const cleanUrl = url.split("#")[0];
  return (
    allRoutes.find((element) => element.url === cleanUrl) ||
    allRoutes.find((element) => element.url.endsWith("*") && cleanUrl.startsWith(element.url.slice(0, -1))) ||
    route404
  );
};

// Contrôle d'accès : un visiteur est envoyé vers la connexion,
// un utilisateur connecté sans le bon rôle voit « Accès refusé ».
// (Côté front uniquement : le back-end devra aussi vérifier les droits.)
const checkAccess = (route) => {
  if (!route.roles || route.roles.length === 0) return route;
  const role = localStorage.getItem("userRole") || "visitor";
  if (route.roles.includes(role)) return route;
  if (role === "visitor") {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.history.replaceState({}, "", `/signin?redirect=${redirect}`);
    return getRouteByUrl("/signin");
  }
  return route403;
};

// Défilement vers une ancre
const scrollToHash = (hash) => {
  if (!hash) return;
  const targetElement = document.querySelector(hash);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// Chargement du contenu de la page
const LoadContentPage = async (targetHash = null) => {
  const actualRoute = checkAccess(getRouteByUrl(window.location.pathname));
  const mainPageContainer = document.getElementById("main-page");

  // On vérifie la réponse : on n'injecte jamais autre chose qu'une vraie page
  let html;
  try {
    const response = await fetch(actualRoute.pathHtml);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    console.error("Erreur de chargement de la page", error);
    html = "<section><h1>Page introuvable</h1><p>Cette page n'existe pas ou est indisponible.</p></section>";
  }

  mainPageContainer.innerHTML = html;

  // Défilement vers l'ancre ou retour en haut
  const hashToScroll = targetHash || window.location.hash;

  if (hashToScroll) {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector(hashToScroll)) {
        scrollToHash(hashToScroll);
        obs.disconnect();
      }
    });
    observer.observe(mainPageContainer, { childList: true, subtree: true });

    setTimeout(() => {
      scrollToHash(hashToScroll);
      observer.disconnect();
    }, 300);
  } else {
    window.scrollTo(0, 0);
  }

  // Script spécifique à la page (on retire l'ancien pour éviter les doublons)
  document.querySelectorAll("script[data-page-script]").forEach((s) => s.remove());
  if (actualRoute.pathJS) {
    const scriptTag = document.createElement("script");
    scriptTag.src = actualRoute.pathJS;
    scriptTag.dataset.pageScript = "true";
    document.body.appendChild(scriptTag);
  }

  document.title = `${actualRoute.title} - ${websiteName}`;
};

// Chargement du header selon le rôle
const loadHeader = async () => {
  const userRole = localStorage.getItem("userRole") || "visitor";
  const headerMap = {
    admin: "/frontend/components/admin-header.html",
    client: "/frontend/components/client-header.html",
    employee: "/frontend/components/employee-header.html",
  };
  const headerPath = headerMap[userRole] || "/frontend/components/public-header.html";

  try {
    const response = await fetch(headerPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const container = document.getElementById("header-container");
    container.innerHTML = await response.text();

    // Nom et rôle de la personne connectée
    const user = window.VG?.session.user();
    if (user) {
      container.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = user.firstName));
      container.querySelectorAll("[data-user-role]").forEach((el) => (el.textContent = window.VG.ROLE_LABELS[user.role]));
    }

    // Lien de la page en cours
    const path = window.location.pathname;
    container.querySelectorAll(".nav-links a, .staff-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      const current = !href.includes("#") && !a.hasAttribute("data-logout") &&
        (href === path || (a.dataset.activeFor || "").split(" ").includes(path));
      a.classList.toggle("active", current);
      if (current) a.setAttribute("aria-current", "page");
    });
  } catch (error) {
    console.error("Erreur de chargement du header", error);
  }
};

// Navigation SPA
const navigate = (href) => {
  window.history.pushState({}, "", href);
  const hash = href.includes("#") ? "#" + href.split("#")[1] : null;
  LoadContentPage(hash);
  loadHeader();
};

// Navigation depuis les scripts de page (ex. après connexion)
window.navigateTo = navigate;

// Déconnexion : on oublie la session pour réafficher le header public
const logout = () => {
  if (window.VG) window.VG.session.logout();
  else localStorage.removeItem("userRole");
};

// Boutons Précédent / Suivant
window.onpopstate = () => {
  LoadContentPage(window.location.hash || null);
  loadHeader();
};

// Compatibilité si certains liens utilisent encore onclick="route(event)"
window.route = (event) => {
  event.preventDefault();
  if (event.currentTarget.hasAttribute("data-logout")) logout();
  navigate(event.currentTarget.getAttribute("href"));
};

// Écouteur global des clics
document.addEventListener("click", (e) => {
  // 1. Menu burger
  const burgerToggle = document.getElementById("burger-toggle");
  const navLinks = document.getElementById("nav-links");

  if (burgerToggle && navLinks) {
    if (burgerToggle.contains(e.target)) {
      navLinks.classList.toggle("active");
    } else {
      navLinks.classList.remove("active");
    }
  }

  // 2. Liens
  const link = e.target.closest("a");
  if (link && link.getAttribute("href") && !link.hasAttribute("onclick")) {
    const href = link.getAttribute("href");

    // Ancre sur la même page
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToHash(href);
      return;
    }

    // Route SPA interne
    if (href.startsWith("/") && !href.startsWith("//")) {
      e.preventDefault();
      if (link.hasAttribute("data-logout")) logout();
      navigate(href);
      return;
    }
  }

  // 3. Afficher / masquer le mot de passe
  if (e.target?.classList.contains("toggle-pwd")) {
    const input = e.target.closest(".password-wrapper")?.querySelector("input");
    if (input) {
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      e.target.textContent = isPwd ? "Masquer" : "Afficher";
    }
  }
});

// Initialisation
LoadContentPage(window.location.hash || null);
loadHeader();