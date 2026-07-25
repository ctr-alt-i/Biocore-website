document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');

  const closeNavigation = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  if (nav && navToggle) {
    navToggle.addEventListener('click', () => {
      const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('open', willOpen);
      navToggle.setAttribute('aria-expanded', String(willOpen));
      document.body.classList.toggle('nav-open', willOpen);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNavigation(); });
  }

  const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 14);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const productCards = document.querySelectorAll('[data-category]');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      productCards.forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requestedSample = params.get('sample');
  const sampleSelect = document.querySelector('#sample_type');
  if (requestedSample && sampleSelect) {
    const matchingOption = Array.from(sampleSelect.options).find((option) => option.value.toLowerCase() === requestedSample.toLowerCase());
    if (matchingOption) sampleSelect.value = matchingOption.value;
  }

  const formStatus = params.get('status');
  if (formStatus) {
    const statusNode = document.querySelector(`[data-form-status="${CSS.escape(formStatus)}"]`);
    if (statusNode) {
      statusNode.hidden = false;
      statusNode.focus();
    }
  }

  const formStarted = document.querySelector('[data-form-started]');
  if (formStarted) formStarted.value = String(Math.floor(Date.now() / 1000));

  const cookieBanner = document.querySelector('[data-cookie-banner]');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const hasConsent = document.cookie.split(';').some((item) => item.trim().startsWith('biocore_notice_accepted='));
  if (cookieBanner && !hasConsent) cookieBanner.hidden = false;
  cookieAccept?.addEventListener('click', () => {
    document.cookie = 'biocore_notice_accepted=yes; max-age=31536000; path=/; SameSite=Lax';
    if (cookieBanner) cookieBanner.hidden = true;
  });
});
