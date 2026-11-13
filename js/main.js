/**
 * Daxentra — Main JavaScript
 * Handles: mobile navigation, scroll reveals, active nav,
 * header state, projects carousel, and copyright year.
 */

(function () {
  'use strict';

  /* ================================================
     UTILITIES
     ================================================ */

  /** Check if user prefers reduced motion */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ================================================
     PROJECTS CAROUSEL DATA
     ================================================
     Edit this array to update carousel projects.
     Each object needs: name, category, gradient (1–8).
     Replace `image` with a real path when screenshots
     are available (e.g. "assets/project-1.jpg").
     ================================================ */

  var projects = [
    { name: 'Greenleaf Market',  category: 'E-Commerce',       gradient: 1, image: null },
    { name: 'Atlas Financial',   category: 'Business Website',  gradient: 2, image: null },
    { name: 'Pulse Fitness',     category: 'SaaS Platform',     gradient: 3, image: null },
    { name: 'NovaPay',           category: 'Dashboard',         gradient: 4, image: null },
    { name: 'Horizon Travel',    category: 'Business Website',  gradient: 5, image: null },
    { name: 'CraftBrew Co.',     category: 'E-Commerce',        gradient: 6, image: null },
    { name: 'SkillForge',        category: 'SaaS Platform',     gradient: 7, image: null },
    { name: 'Lumina Studios',    category: 'Landing Page',      gradient: 8, image: null },
  ];

  /* ================================================
     PROJECTS CAROUSEL INIT
     ================================================ */

  var carouselTrack = document.getElementById('carousel-track');

  if (carouselTrack) {
    // Build a single card's HTML
    function buildCard(project) {
      var imageContent;
      if (project.image) {
        imageContent =
          '<img src="' + project.image + '" alt="' + project.name + ' preview" loading="lazy">';
      } else {
        imageContent =
          '<div class="placeholder-gradient gradient-' + project.gradient + '">' +
            '<span class="placeholder-icon">' +
              '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' +
            '</span>' +
          '</div>';
      }

      return (
        '<div class="carousel-card">' +
          '<div class="carousel-card-image">' + imageContent + '</div>' +
          '<div class="carousel-card-info">' +
            '<p class="carousel-card-category">' + project.category + '</p>' +
            '<p class="carousel-card-name">' + project.name + '</p>' +
          '</div>' +
        '</div>'
      );
    }

    // Build full set (original + duplicate for seamless loop)
    var cardsHTML = '';
    for (var i = 0; i < projects.length; i++) {
      cardsHTML += buildCard(projects[i]);
    }
    // Duplicate for seamless infinite scroll
    for (var j = 0; j < projects.length; j++) {
      cardsHTML += buildCard(projects[j]);
    }
    carouselTrack.innerHTML = cardsHTML;
  }

  /* ================================================
     COPYRIGHT YEAR
     ================================================ */

  const yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ================================================
     MOBILE NAVIGATION
     ================================================ */

  const header = document.getElementById('site-header');
  const menuBtn = document.getElementById('mobile-menu-btn');
  const desktopNav = document.getElementById('main-nav');
  const mobileDrawer = document.getElementById('mobile-nav');

  if (menuBtn && header) {
    const focusableInDrawer = () =>
      mobileDrawer ? mobileDrawer.querySelectorAll('a[href], button:not([disabled])') : [];

    function openMenu() {
      header.classList.add('nav-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close navigation menu');

      // Focus first link in drawer after transition begins
      const links = focusableInDrawer();
      if (links.length) {
        setTimeout(() => links[0].focus(), 150);
      }
    }

    function closeMenu() {
      header.classList.remove('nav-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open navigation menu');
      menuBtn.focus();
    }

    function toggleMenu() {
      const isOpen = header.classList.contains('nav-open');
      isOpen ? closeMenu() : openMenu();
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking ANY link inside the mobile drawer
    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', function () {
          if (header.classList.contains('nav-open')) {
            closeMenu();
          }
        });
      });
    }

    // Close menu when clicking desktop nav links too
    if (desktopNav) {
      desktopNav.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', function () {
          if (header.classList.contains('nav-open')) {
            closeMenu();
          }
        });
      });
    }

    // Close on click outside header
    document.addEventListener('click', function (e) {
      if (
        header.classList.contains('nav-open') &&
        !header.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        closeMenu();
      }
    });

    // Auto-close drawer if screen resized to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && header.classList.contains('nav-open')) {
        closeMenu();
      }
    });

    // Trap focus within mobile drawer when open
    if (mobileDrawer) {
      mobileDrawer.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || !header.classList.contains('nav-open')) return;

        const focusable = focusableInDrawer();
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          menuBtn.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          menuBtn.focus();
        }
      });
    }

    menuBtn.addEventListener('keydown', function (e) {
      if (
        e.key === 'Tab' &&
        !e.shiftKey &&
        header.classList.contains('nav-open')
      ) {
        const focusable = focusableInDrawer();
        if (focusable.length) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    });
  }

  /* ================================================
     HEADER SCROLL STATE
     ================================================ */

  if (header) {
    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state
    updateHeader();
  }

  /* ================================================
     ACTIVE NAV LINK HIGHLIGHTING
     ================================================ */

  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link, .mobile-nav-link');

  if (sections.length && navItems.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navItems.forEach(function (link) {
              link.classList.toggle(
                'nav-link-active',
                link.getAttribute('href') === '#' + id
              );
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ================================================
     SCROLL REVEAL ANIMATIONS
     ================================================ */

  if (!prefersReducedMotion()) {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length) {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -80px 0px',
          threshold: 0.1,
        }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  } else {
    // If reduced motion is preferred, make everything visible immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
     ================================================ */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Skip bare "#" links (like logo)

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Read base header bar height to ensure accurate offset even when drawer is closing
      const headerInner = document.querySelector('.header-inner');
      const headerHeight = headerInner ? headerInner.offsetHeight : (header ? header.offsetHeight : 0);
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });

      // Update URL without triggering scroll
      history.pushState(null, '', targetId);

      // Move focus to target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener(
        'blur',
        function () {
          target.removeAttribute('tabindex');
        },
        { once: true }
      );
    });
  });

})();
