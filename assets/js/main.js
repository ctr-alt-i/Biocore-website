document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNavigation = window.matchMedia('(max-width: 900px)');

  const setNavigation = (open, restoreFocus = false) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
    document.body.classList.toggle('nav-open', open);
    nav.inert = mobileNavigation.matches && !open;
    if (restoreFocus) navToggle.focus();
  };

  if (nav && navToggle) {
    setNavigation(false);
    navToggle.addEventListener('click', () => setNavigation(navToggle.getAttribute('aria-expanded') !== 'true'));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNavigation(false)));
    mobileNavigation.addEventListener('change', () => setNavigation(false));
    document.addEventListener('keydown', (event) => {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') setNavigation(false, true);
      if (event.key !== 'Tab') return;
      const lastLink = nav.querySelector('a:last-child');
      if (event.shiftKey && document.activeElement === navToggle) {
        event.preventDefault();
        lastLink.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        navToggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (navToggle.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setNavigation(false);
    });
  }

  const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 14);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

  const filterButtons = document.querySelectorAll('[data-filter]');
  const productCards = document.querySelectorAll('[data-category]');
  const resultCount = document.querySelector('[data-result-count]');
  const applyFilter = (filter) => {
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    productCards.forEach((card) => {
      card.hidden = filter !== 'all' && !(card.dataset.category || '').split(' ').includes(filter);
      if (!card.hidden) count++;
    });
    if (resultCount) resultCount.textContent = `${count} ${count === 1 ? 'specialization' : 'specializations'}`;
  };
  filterButtons.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  // A direct category link must remain visible after a filtered view.
  window.addEventListener('hashchange', () => {
    const linkedCard = Array.from(productCards).find((card) => `#${card.id}` === window.location.hash);
    if (linkedCard?.hidden) {
      applyFilter('all');
      linkedCard.scrollIntoView();
    }
  });

  const form = document.querySelector('[data-inquiry-form]');
  const draft = document.querySelector('[data-inquiry-draft]');
  const draftMessage = document.querySelector('[data-inquiry-message]');
  const draftEmail = document.querySelector('[data-draft-email]');
  const copyStatus = document.querySelector('[data-copy-status]');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = new FormData(form);
    const value = (key) => String(values.get(key) || '').trim() || 'Not specified';
    const subject = `Biospecimen inquiry — ${value('company')}`;
    const message = [
      'Hello BioCore Solution,', '',
      'I would like to discuss the following biospecimen requirements.', '',
      'CONTACT DETAILS',
      `Name: ${value('name')}`, `Company: ${value('company')}`,
      `Work email: ${value('email')}`, `Phone: ${value('phone')}`, '',
      'PROJECT DESCRIPTION',
      value('description'), '', 'You may use this information to respond to my inquiry.'
    ].join('\n');
    draftMessage.value = message;
    draftEmail.href = `mailto:mv@biocoresolution.us?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    copyStatus.textContent = '';
    draft.hidden = false;
    document.querySelector('#draft-title').focus({ preventScroll: true });
    draft.scrollIntoView({ block: 'center' });
  });
  form?.addEventListener('input', (event) => {
    if (event.target === draftMessage) return;
    draft.hidden = true;
    copyStatus.textContent = '';
  });
  document.querySelector('[data-copy-inquiry]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftMessage.value);
      copyStatus.textContent = 'Inquiry copied. Paste it into an email to our team.';
    } catch {
      draftMessage.focus();
      draftMessage.select();
      copyStatus.textContent = 'Select and copy the message above, then paste it into your email app.';
    }
  });

  const cookieBanner = document.querySelector('[data-cookie-banner]');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const hasConsent = document.cookie.split(';').some((item) => item.trim().startsWith('biocore_notice_accepted='));
  if (cookieBanner && !hasConsent) cookieBanner.hidden = false;
  cookieAccept?.addEventListener('click', () => {
    document.cookie = 'biocore_notice_accepted=yes; max-age=31536000; path=/; SameSite=Lax';
    if (cookieBanner) cookieBanner.hidden = true;
  });
});
