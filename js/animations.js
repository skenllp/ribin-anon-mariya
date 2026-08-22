/* -----------------------------------------------------------------
   ACROSS OCEANS, GUIDED BY FAITH - CANVAS ANIMATION ENGINE
   - Ambient floating particles (stained glass rays & golden embers)
   - Chapter 5 interactive ocean & flight route canvas animation
   ----------------------------------------------------------------- */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 50;

    this.resize();
    this.initParticles();
    this.animate();

    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 106, ' : 'rgba(107, 142, 139, ',
        alpha: Math.random() * 0.5 + 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.5 - 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

      if (p.y < 0) {
        p.y = this.canvas.height;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.max(0.05, Math.min(0.7, p.alpha)) + ')';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#D4AF6A';
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

class MapRouteEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.progress = 0;

    this.resize();
    this.animate();

    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    }
  }

  animate() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // Waypoints
    const p1 = { x: w * 0.2, y: h * 0.35, label: 'Ribin' };
    const p2 = { x: w * 0.45, y: h * 0.5, label: 'Anon Mariya' };
    const p3 = { x: w * 0.8, y: h * 0.75, label: 'Kerala 🇮🇳 (Home & Destiny)' };

    // Draw connecting curve
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.quadraticCurveTo(w * 0.35, h * 0.2, p2.x, p2.y);
    this.ctx.quadraticCurveTo(w * 0.65, h * 0.3, p3.x, p3.y);
    this.ctx.strokeStyle = 'rgba(212, 175, 106, 0.35)';
    this.ctx.setLineDash([6, 6]);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Animated Progress Dot
    this.progress += 0.003;
    if (this.progress > 1) this.progress = 0;

    let currentX, currentY;
    if (this.progress <= 0.4) {
      const t = this.progress / 0.4;
      currentX = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * (w * 0.35) + t * t * p2.x;
      currentY = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * (h * 0.2) + t * t * p2.y;
    } else {
      const t = (this.progress - 0.4) / 0.6;
      currentX = (1 - t) * (1 - t) * p2.x + 2 * (1 - t) * t * (w * 0.65) + t * t * p3.x;
      currentY = (1 - t) * (1 - t) * p2.y + 2 * (1 - t) * t * (h * 0.3) + t * t * p3.y;
    }

    // Draw glowing traveler node
    this.ctx.beginPath();
    this.ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#D4AF6A';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#D4AF6A';
    this.ctx.fill();

    // Draw Waypoint Markers
    [p1, p2, p3].forEach((pt) => {
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(35, 72, 106, 0.9)';
      this.ctx.strokeStyle = '#D4AF6A';
      this.ctx.lineWidth = 2;
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.font = '12px Inter, sans-serif';
      this.ctx.fillStyle = '#FCFBF8';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = '#000';
      this.ctx.fillText(pt.label, pt.x - 40, pt.y - 16);
    });

    requestAnimationFrame(() => this.animate());
  }
}

window.ParticleEngine = ParticleEngine;
window.MapRouteEngine = MapRouteEngine;

