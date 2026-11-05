import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Route de secours (404)
const route404 = new Route("404", "Page introuvable", "/frontend/pages/public/404.html");

// Recherche de la route associée à l'URL (ancre ignorée)
const getRouteByUrl = (url) => {
  const cleanUrl = url.split("#")[0];
  return allRoutes.find((element) => element.url === cleanUrl) || route404;
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
  const actualRoute = getRouteByUrl(window.location.pathname);
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
    document.getElementById("header-container").innerHTML = await response.text();
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

// Boutons Précédent / Suivant
window.onpopstate = () => {
  LoadContentPage(window.location.hash || null);
  loadHeader();
};

// Compatibilité si certains liens utilisent encore onclick="route(event)"
window.route = (event) => {
  event.preventDefault();
  // Déconnexion : on oublie le rôle pour réafficher le header public
  if (event.currentTarget.hasAttribute("data-logout")) {
    localStorage.removeItem("userRole");
  }
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