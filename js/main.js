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

  function initializeStyledSelect(selectElement, valueInput, onSelect) {
    const trigger = selectElement.querySelector('.contact-select-trigger');
    const valueLabel = selectElement.querySelector('.contact-select-value');
    const optionsPanel = selectElement.querySelector('.contact-select-options');
    const options = Array.from(selectElement.querySelectorAll('.contact-select-option'));
    const field = selectElement.closest('.contact-select-field');
    let activeIndex = -1;
    valueLabel.dataset.placeholder = valueLabel.dataset.placeholder || valueLabel.textContent;

    function syncValue() {
      const selectedOption = options.find(function (option) {
        return option.dataset.value === valueInput.value;
      });

      valueLabel.textContent = selectedOption ? selectedOption.textContent : valueLabel.dataset.placeholder;
      selectElement.classList.toggle('has-value', Boolean(selectedOption));
      options.forEach(function (option) {
        option.setAttribute('aria-selected', String(option === selectedOption));
      });

      if (selectedOption && field) {
        field.classList.remove('is-invalid');
        trigger.removeAttribute('aria-invalid');
      }
    }

    function setActiveOption(index) {
      activeIndex = (index + options.length) % options.length;
      options.forEach(function (option, optionIndex) {
        option.classList.toggle('is-active', optionIndex === activeIndex);
      });
      trigger.setAttribute('aria-activedescendant', options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function openOptions() {
      optionsPanel.hidden = false;
      selectElement.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      const selectedIndex = options.findIndex(function (option) {
        return option.dataset.value === valueInput.value;
      });
      setActiveOption(selectedIndex >= 0 ? selectedIndex : 0);
    }

    function closeOptions() {
      optionsPanel.hidden = true;
      selectElement.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      options.forEach(function (option) { option.classList.remove('is-active'); });
      activeIndex = -1;
    }

    function chooseOption(option) {
      valueInput.value = option.dataset.value;
      valueInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (onSelect) onSelect(option);
      closeOptions();
      trigger.focus();
    }

    function reset() {
      valueInput.value = '';
      valueInput.dispatchEvent(new Event('change', { bubbles: true }));
      closeOptions();
    }

    options.forEach(function (option, index) {
      option.id = selectElement.id + '-option-' + (index + 1);
      option.tabIndex = -1;
      option.addEventListener('click', function () { chooseOption(option); });
    });

    trigger.addEventListener('click', function () {
      if (optionsPanel.hidden) openOptions();
      else closeOptions();
    });
    trigger.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (optionsPanel.hidden) openOptions();
        else setActiveOption(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
      } else if ((event.key === 'Enter' || event.key === ' ') && !optionsPanel.hidden) {
        event.preventDefault();
        chooseOption(options[activeIndex]);
      } else if (event.key === 'Escape' && !optionsPanel.hidden) {
        event.preventDefault();
        closeOptions();
      } else if (event.key === 'Home' && !optionsPanel.hidden) {
        event.preventDefault();
        setActiveOption(0);
      } else if (event.key === 'End' && !optionsPanel.hidden) {
        event.preventDefault();
        setActiveOption(options.length - 1);
      }
    });
    document.addEventListener('click', function (event) {
      if (!selectElement.contains(event.target)) closeOptions();
    });
    valueInput.addEventListener('change', syncValue);
    syncValue();

    return { open: openOptions, reset: reset };
  }

  function initThemeToggle() {
    const root = document.documentElement;
    const button = document.getElementById('theme-toggle');
    if (!button) return;

    const darkLogo = 'assets/images/Logo/full_name_logo.png';
    const lightLogo = 'assets/images/Logo/Daxentra_Studios_Green Orbit_Logo_for_light_theme.png';

    function updateButton() {
      const isLight = root.getAttribute('data-theme') === 'light';
      button.setAttribute('aria-pressed', String(isLight));
      button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');

      document.querySelectorAll('.logo-image').forEach(function (logo) {
        logo.src = isLight ? lightLogo : darkLogo;
      });
    }

    button.addEventListener('click', function () {
      const nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', nextTheme);
      updateButton();

      try {
        window.localStorage.setItem('daxentra-theme', nextTheme);
      } catch (error) {
        console.warn('Theme preference could not be saved.', error);
      }
    });

    updateButton();
  }

  /* ================================================
     PROJECTS CAROUSEL DATA
     ================================================
     Edit this array to update carousel projects.
     Each object needs: name, category, gradient (1–8), and image.
     ================================================ */

  var projects = [
    { name: 'Greenleaf Market',  category: 'E-Commerce',       gradient: 1, image: 'assets/images/slider/ecommerce.png' },
    { name: 'Atlas Financial',   category: 'Business Website',  gradient: 2, image: 'assets/images/slider/business.jpg' },
    { name: 'Pulse Fitness',     category: 'SaaS Platform',     gradient: 3, image: 'assets/images/slider/saas.png' },
    { name: 'NovaPay',           category: 'Dashboard',         gradient: 4, image: 'assets/images/slider/Dshboard.png' },
    { name: 'Horizon Travel',    category: 'Business Website',  gradient: 5, image: 'assets/images/slider/business.jpg' },
    { name: 'CraftBrew Co.',     category: 'E-Commerce',        gradient: 6, image: 'assets/images/slider/ecommerce.png' },
    { name: 'SkillForge',        category: 'SaaS Platform',     gradient: 7, image: 'assets/images/slider/saas.png' },
    { name: 'Lumina Studios',    category: 'Landing Page',      gradient: 8, image: 'assets/images/slider/Landing_pages.png' },
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
     PROJECT INQUIRY FORM
     ================================================ */

  document.querySelectorAll('.career-select').forEach(function (selectElement) {
    const field = selectElement.closest('.career-field');
    initializeStyledSelect(selectElement, field.querySelector('input[type="hidden"]'));
  });

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const contactNote = document.querySelector('#contact-form-note');
    const successDialog = document.querySelector('#contact-success-dialog');
    const projectKicker = contactForm.querySelector('.contact-form-kicker');
    const projectInput = document.querySelector('#contact-project');
    const projectSelect = document.querySelector('#contact-project-select');
    let contactNoteTimeout;
    let projectDropdown;

    if (successDialog) {
      const closeButton = successDialog.querySelector('.contact-success-close');
      closeButton.addEventListener('click', function () {
        successDialog.close();
      });
      successDialog.addEventListener('click', function (event) {
        if (event.target === successDialog) successDialog.close();
      });
      successDialog.addEventListener('close', function () {
        contactForm.querySelector('[type="submit"]').focus();
      });
    }

    if (projectSelect && projectInput) {
      projectDropdown = initializeStyledSelect(projectSelect, projectInput, function () {
        projectSelect.closest('.contact-select-field').classList.remove('is-invalid');
        window.clearTimeout(contactNoteTimeout);
        contactNoteTimeout = null;
        if (contactNote) {
          contactNote.textContent = '';
          contactNote.hidden = true;
          contactNote.classList.remove('is-ready', 'is-error');
        }
      });
    }

    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      window.clearTimeout(contactNoteTimeout);
      contactNoteTimeout = null;
      if (projectInput && !projectInput.value) {
        const projectField = document.querySelector('.contact-select-field');
        projectField.classList.add('is-invalid');
        if (contactNote) {
          contactNote.textContent = 'Choose a project type to continue, or select “Not sure yet”.';
          contactNote.hidden = false;
        }
        const trigger = document.querySelector('#contact-project-trigger');
        trigger.focus();
        if (projectDropdown) projectDropdown.open();
        return;
      }
      const submitButton = contactForm.querySelector('[type="submit"]');
      if (submitButton.disabled) return;
      submitButton.disabled = true;
      contactForm.setAttribute('aria-busy', 'true');
      if (contactNote) {
        contactNote.textContent = 'Sending your message…';
        contactNote.hidden = false;
        contactNote.classList.remove('is-ready', 'is-error');
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
        });
        const result = await response.json();
        if (!response.ok || !result || !result.success) {
          throw new Error(result && result.message ? result.message : 'The form service could not send your message.');
        }

        contactForm.reset();
        if (projectDropdown) projectDropdown.reset();
        if (contactNote) {
          contactNote.textContent = 'Thanks! Your message has been sent. We’ll be in touch soon.';
          contactNote.classList.add('is-ready');
          contactNoteTimeout = window.setTimeout(function () {
            contactNote.hidden = true;
            contactNote.textContent = '';
            contactNote.classList.remove('is-ready');
          }, 2000);
        }
        if (projectKicker) projectKicker.hidden = true;
        if (successDialog && !successDialog.open) {
          successDialog.showModal();
        }
      } catch (error) {
        if (contactNote) {
          contactNote.textContent = 'We couldn’t send your message. Please try again or email hello@daxentra.com.';
          contactNote.classList.add('is-error');
        }
        console.error('Contact form submission failed:', error);
      } finally {
        submitButton.disabled = false;
        contactForm.removeAttribute('aria-busy');
      }
    });
  }

  /* ================================================
     TEAM CATEGORY FILTERS
     ================================================ */

  const teamFilterGroup = document.querySelector('[data-team-filters]');
  if (teamFilterGroup) {
    const teamFilterButtons = Array.from(teamFilterGroup.querySelectorAll('[data-team-filter]'));
    const teamCards = Array.from(document.querySelectorAll('[data-team-grid] .team-member'));
    const teamFilterStatus = document.getElementById('team-filter-status');
    const teamEmptyState = document.querySelector('[data-team-empty]');

    function filterTeamMembers(category) {
      let visibleCount = 0;

      teamCards.forEach(function (card) {
        const categories = (card.dataset.categories || '').split(/\s+/);
        const isVisible = category === 'all' || categories.includes(category);

        card.classList.remove('filter-entering');
        card.hidden = !isVisible;
        if (isVisible) {
          card.style.setProperty('--filter-index', visibleCount);
          if (!prefersReducedMotion()) {
            window.requestAnimationFrame(function () {
              card.classList.add('filter-entering');
            });
          }
          visibleCount += 1;
        }
      });

      teamFilterButtons.forEach(function (button) {
        const isActive = button.dataset.teamFilter === category;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      if (teamFilterStatus) {
        teamFilterStatus.textContent = 'Showing ' + visibleCount + ' team member' + (visibleCount === 1 ? '' : 's');
      }
      if (teamEmptyState) {
        teamEmptyState.hidden = visibleCount > 0;
      }
    }

    teamFilterGroup.addEventListener('click', function (event) {
      const button = event.target.closest('[data-team-filter]');
      if (button && teamFilterGroup.contains(button)) {
        filterTeamMembers(button.dataset.teamFilter);
      }
    });
  }

  /* ================================================
     REVIEW CAROUSEL
     ================================================ */

  const reviewTrack = document.getElementById('review-track');
  const reviewDots = document.getElementById('review-dots');

  if (reviewTrack && reviewDots) {
    const reviews = [
      {
        initials: 'AM',
        name: 'Aman Gupta',
        role: 'Founder, StyleKart',
        company: 'StyleKart',
        text: 'Daxentra built our e-commerce platform exactly how we envisioned it. The design, performance, and support were outstanding!'
      },
      {
        initials: 'PS',
        name: 'Priya Sharma',
        role: 'Product Manager, Taskly',
        company: 'Taskly',
        text: 'A highly professional and skilled team. They understood our requirements clearly and delivered a scalable SaaS product on time.'
      },
      {
        initials: 'RM',
        name: 'Rohit Mehra',
        role: 'CEO, Nexora',
        company: 'Nexora',
        text: 'Great communication, clean code, and a design that truly stands out. Daxentra is our go-to team for all things web.'
      },
      {
        initials: 'NV',
        name: 'Neha Verma',
        role: 'Co-founder, Finly',
        company: 'Finly',
        text: 'They turned a rough idea into a polished fintech dashboard. Fast iterations, honest advice, and zero surprises along the way.'
      },
      {
        initials: 'KS',
        name: 'Karan Singh',
        role: 'CTO, Cloudio',
        company: 'Cloudio',
        text: 'Their engineering depth is rare. Our cloud migration was smooth, well documented, and delivered ahead of schedule.'
      }
    ];

    let activeReview = 1;
    let reviewPaused = false;
    let reviewTimer;
    const cards = [];
    const dots = [];
    const reduceMotion = prefersReducedMotion();

    reviews.forEach((review, index) => {
      const card = document.createElement('article');
      card.className = 'review-card';
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${index + 1} of ${reviews.length}`);
      card.innerHTML =
        '<div class="review-card-top">' +
          '<span class="review-quote-mark" aria-hidden="true">&ldquo;</span>' +
          '<span class="review-verified">✓ Verified Client</span>' +
        '</div>' +
        '<div class="review-stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>' +
        `<p class="review-quote">&ldquo;${review.text}&rdquo;</p>` +
        '<div class="review-author">' +
          `<span class="review-avatar" aria-hidden="true">${review.initials}</span>` +
          `<div class="review-author-info"><strong>${review.name}</strong><span>${review.role}</span></div>` +
          `<span class="review-company">${review.company}</span>` +
        '</div>';
      card.addEventListener('click', () => {
        if (index !== activeReview) goToReview(index);
      });
      reviewTrack.appendChild(card);
      cards.push(card);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'review-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show review ${index + 1}`);
      dot.addEventListener('click', () => goToReview(index));
      reviewDots.appendChild(dot);
      dots.push(dot);
    });

    function wrapReviewOffset(index) {
      let offset = ((index - activeReview) % reviews.length + reviews.length) % reviews.length;
      if (offset > reviews.length / 2) offset -= reviews.length;
      return offset;
    }

    function layoutReviews(instant = false) {
      const width = reviewTrack.clientWidth;
      const threeCards = width > 980;
      const cardWidth = threeCards ? Math.min(350, (width - 40) / 3) : Math.min(width, 460);
      const step = cardWidth + 20;

      cards.forEach((card) => {
        card.style.width = `${cardWidth}px`;
      });

      const cardHeights = cards.map((card) => {
        card.style.height = 'auto';
        return card.offsetHeight;
      });
      const maxHeight = Math.max(...cardHeights);
      cards.forEach((card) => { card.style.height = `${maxHeight}px`; });
      reviewTrack.style.height = `${maxHeight}px`;

      cards.forEach((card, index) => {
        const offset = wrapReviewOffset(index);
        const visible = threeCards ? Math.abs(offset) <= 1 : offset === 0;
        if (instant || reduceMotion) card.style.transition = 'none';
        const scale = offset === 0 ? 1 : 0.94;
        card.style.transform = `translateX(calc(-50% + ${offset * step}px)) scale(${scale})`;
        card.classList.toggle('is-active', offset === 0);
        card.classList.toggle('is-hidden', !visible);
        card.setAttribute('aria-hidden', String(!visible));
        if (instant || reduceMotion) {
          void card.offsetWidth;
          card.style.transition = '';
        }
      });

      dots.forEach((dot, index) => {
        dot.setAttribute('aria-selected', String(index === activeReview));
      });
    }

    function restartReviews() {
      window.clearInterval(reviewTimer);
      if (!reduceMotion) {
        reviewTimer = window.setInterval(() => {
          if (!reviewPaused && !document.hidden) goToReview(activeReview + 1, false);
        }, 6500);
      }
    }

    function goToReview(index, restart = true) {
      activeReview = ((index % reviews.length) + reviews.length) % reviews.length;
      layoutReviews(false);
      if (restart) restartReviews();
    }

    function previousReview() { goToReview(activeReview - 1); }
    function nextReview() { goToReview(activeReview + 1); }

    document.querySelectorAll('.review-arrow-prev').forEach((button) => {
      button.addEventListener('click', previousReview);
    });
    document.querySelectorAll('.review-arrow-next').forEach((button) => {
      button.addEventListener('click', nextReview);
    });

    const carousel = reviewTrack.closest('.review-carousel');
    carousel.addEventListener('mouseenter', () => { reviewPaused = true; });
    carousel.addEventListener('mouseleave', () => { reviewPaused = false; });
    carousel.addEventListener('focusin', () => { reviewPaused = true; });
    carousel.addEventListener('focusout', () => { reviewPaused = false; });
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); previousReview(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); nextReview(); }
    });

    let swipeStartX = null;
    let swipeStartY = 0;
    reviewTrack.addEventListener('pointerdown', (event) => {
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
    });
    reviewTrack.addEventListener('pointerup', (event) => {
      if (swipeStartX === null) return;
      const dx = event.clientX - swipeStartX;
      const dy = event.clientY - swipeStartY;
      swipeStartX = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? nextReview() : previousReview();
    });
    reviewTrack.addEventListener('pointercancel', () => { swipeStartX = null; });

    let reviewResizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(reviewResizeTimer);
      reviewResizeTimer = window.setTimeout(() => layoutReviews(true), 80);
    });

    layoutReviews(true);
    restartReviews();
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

  initThemeToggle();

})();
