/* -----------------------------------------------------------------
   SINI & MARTIN — PAGE 1 : OPENING (THE SACRED COVER)
   Entrance only. Entry to Page 2 is exclusively via the tap button —
   handled in js/main.js. No scroll / swipe / keyboard shortcuts.
   ----------------------------------------------------------------- */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var cover = document.getElementById('page-sacred-opening');
    if (!cover) return;

    cover.classList.add('js');
    document.body.classList.add('cover-locked');

    // Block scroll while the cover is up (wheel / touch / keys).
    function blockScroll(event) {
      if (!document.body.classList.contains('cover-locked')) return;
      event.preventDefault();
    }

    function blockKeys(event) {
      if (!document.body.classList.contains('cover-locked')) return;
      var keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar', 'Home', 'End'];
      if (keys.indexOf(event.key) !== -1) event.preventDefault();
    }

    cover.addEventListener('wheel', blockScroll, { passive: false });
    cover.addEventListener('touchmove', blockScroll, { passive: false });
    window.addEventListener('keydown', blockKeys);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cover.classList.add('is-ready');
      });
    });
  });
})();
