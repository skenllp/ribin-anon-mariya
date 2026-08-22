/* -----------------------------------------------------------------
   SINI & MARTIN — LUXURY INTERACTIVE WEDDING WEBSITE
   Scroll Reveal & Navigation Helper
   ----------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
