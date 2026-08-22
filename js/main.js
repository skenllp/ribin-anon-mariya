/* -----------------------------------------------------------------
   SINI & MARTIN — LUXURY INTERACTIVE WEDDING WEBSITE
   Master JavaScript — cover handoff only.
   Particles live in js/particles.js.
   ----------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const sacredOpening = document.getElementById('page-sacred-opening');
  const btnBeginJourney = document.getElementById('btn-begin-journey');

  // Cover → Page 2: button click only. Zoom + fade, then reveal hero.
  if (btnBeginJourney && sacredOpening) {
    let entering = false;

    btnBeginJourney.addEventListener('click', () => {
      if (entering) return;
      entering = true;

      btnBeginJourney.disabled = true;
      document.body.classList.add('cover-exiting');
      document.body.classList.remove('cover-locked');
      sacredOpening.classList.add('is-leaving');

      if (window.soundscape) {
        window.soundscape.play();
      }

      const heroLanding = document.getElementById('page-hero-landing');
      if (heroLanding) {
        heroLanding.scrollIntoView({ behavior: 'auto', block: 'start' });
      }

      window.setTimeout(() => {
        sacredOpening.classList.add('faded-out');
        sacredOpening.style.display = 'none';
        document.body.classList.remove('cover-exiting');

        document.querySelectorAll('#page-hero-landing .reveal-on-scroll').forEach((el) => {
          el.classList.add('is-visible');
        });
      }, 1200);
    });
  }
});
