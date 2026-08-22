/* -----------------------------------------------------------------
   ACROSS OCEANS, GUIDED BY FAITH - MAP & VENUE NAVIGATION
   Handles Google Maps deep-links for Betrothal & Wedding Ceremonies
   ----------------------------------------------------------------- */

const venues = {
  betrothal: {
    name: "St. Mary's Church",
    location: "Kottayam, Kerala, India",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=St+Marys+Church+Kottayam+Kerala",
    lat: 9.5916,
    lng: 76.5222
  },
  wedding: {
    name: "Mar Sleeva Forane Church",
    location: "Cherpunkal, Kottayam, Kerala, India",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mar+Sleeva+Forane+Church+Cherpunkal+Kerala",
    lat: 9.6805,
    lng: 76.5931
  }
};

class NavigationManager {
  constructor() {
    this.initButtons();
  }

  initButtons() {
    document.querySelectorAll('[data-nav-venue]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const venueKey = btn.getAttribute('data-nav-venue');
        if (venues[venueKey]) {
          window.open(venues[venueKey].googleMapsUrl, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }
}

window.venues = venues;
window.NavigationManager = NavigationManager;

