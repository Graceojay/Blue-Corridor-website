(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  const syncHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const interest = new URLSearchParams(window.location.search).get('interest');
  const interestSelect = document.querySelector('#interest');
  if (interest && interestSelect) {
    const match = Array.from(interestSelect.options).find(option => option.value.toLowerCase() === interest.toLowerCase());
    if (match) interestSelect.value = match.value;
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
