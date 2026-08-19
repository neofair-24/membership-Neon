// ================================================
// Neofair — SPA Router + App Entry
// ================================================

import './style.css';
import { renderHome }       from './pages/home.js';
import { renderMembership } from './pages/membership.js';
import { renderJoin, initJoinForm } from './pages/join.js';

// Silence console output in production to protect member data from DevTools inspection
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// ---- Router ----
const routes = {
  '/':           { render: renderHome,       title: 'Neofair — Premium Beauty Salon',            init: null },
  '/membership': { render: renderMembership, title: 'Membership Privileges — Neofair',            init: null },
  '/join':       { render: renderJoin,       title: 'Join Membership — Neofair',                  init: initJoinForm },
};

function getRoute(path) {
  return routes[path] || routes['/'];
}

function navigate(path) {
  const route = getRoute(path);

  // Update document title
  document.title = route.title;

  // Render page content
  const content = document.getElementById('page-content');
  content.innerHTML = route.render();
  content.classList.remove('page-enter');
  // Force reflow for animation
  void content.offsetWidth;
  content.classList.add('page-enter');

  // Run page-specific init
  if (route.init) {
    setTimeout(route.init, 0); // after DOM paint
  }

  // Update active nav link
  updateActiveNav(path);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Init scroll reveal for the new page
  setTimeout(initReveal, 100);
}

function updateActiveNav(path) {
  document.querySelectorAll('.nav-link[data-link]').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === path);
  });
}

// ---- Link Interception (SPA navigation) ----
function handleLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto')) return;

    e.preventDefault();
    const newPath = href || '/';

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
      navigate(newPath);
      // Close mobile menu if open
      closeMobileMenu();
    }
  });
}

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});

// ---- Navbar Scroll Effect ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Hamburger Menu ----
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// ---- Scroll Reveal (Intersection Observer) ----
let revealObserver = null;

function initReveal() {
  // Clean up old observer
  if (revealObserver) revealObserver.disconnect();

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    // Only observe if not already visible
    if (!el.classList.contains('visible')) {
      revealObserver.observe(el);
    }
  });
}

// ---- Boot ----
function boot() {
  handleLinks();
  initNavbar();
  initHamburger();

  // Handle initial page load
  const path = window.location.pathname;
  navigate(path in routes ? path : '/');
}

// ---- Start App ----
document.addEventListener('DOMContentLoaded', boot);
