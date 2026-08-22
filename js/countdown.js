/* -----------------------------------------------------------------
   RIBIN & ANON MARIYA — LUXURY INTERACTIVE WEDDING WEBSITE
   Countdown to the wedding.
   The target is read from data-target on .mono-countdown so the date
   is edited once, in the markup, next to the text that displays it.
   ----------------------------------------------------------------- */

const WEDDING_FALLBACK = '2026-11-23T11:00:00+05:30';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.mono-countdown');
  const targetAttr = container && container.dataset.target;
  let targetDate = new Date(targetAttr || WEDDING_FALLBACK).getTime();

  // An unparseable date would render NaN across all four units.
  if (Number.isNaN(targetDate)) {
    console.warn('Countdown: unreadable data-target "%s", using fallback.', targetAttr);
    targetDate = new Date(WEDDING_FALLBACK).getTime();
  }

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
