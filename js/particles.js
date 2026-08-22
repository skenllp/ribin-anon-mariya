/* -----------------------------------------------------------------
   SINI & MARTIN — Cinematic golden particle journey
   Drift → scroll parallax → gather → form "THANK YOU" → release
   Lightweight canvas + rAF. No libraries.
   ----------------------------------------------------------------- */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function ParticleField(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.particles = [];
    this.targets = [];
    this.mode = 'drift'; // drift | gather | form | settle | release
    this.modeT = 0;
    this.scrollY = 0;
    this.lastScrollY = 0;
    this.glowSweep = -0.2;
    this.formed = false;
    this.stage = document.getElementById('thank-you-stage');
    this.section = document.getElementById('page-thank-you');
    this.raf = 0;
    this.lastTs = 0;

    this.resize = this.resize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.tick = this.tick.bind(this);

    this.resize();
    this.spawn();
    this.bind();
    this.raf = requestAnimationFrame(this.tick);
  }

  ParticleField.prototype.bind = function () {
    var self = this;
    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });

    if (this.section && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            // Start as soon as the section enters the viewport while scrolling
            if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
              self.beginGather();
            } else if (!entry.isIntersecting && self.mode !== 'drift' && !self.formed) {
              self.mode = 'drift';
              self.modeT = 0;
            }
          });
        },
        { threshold: [0.05, 0.1, 0.2], rootMargin: '0px 0px -5% 0px' }
      );
      io.observe(this.section);
    }

    // Also kick off on scroll when the stage is near the middle of the screen
    window.addEventListener(
      'scroll',
      function () {
        if (self.formed || self.mode !== 'drift' || !self.section) return;
        var rect = self.section.getBoundingClientRect();
        if (rect.top < self.h * 0.85 && rect.bottom > self.h * 0.15) {
          self.beginGather();
        }
      },
      { passive: true }
    );
  };

  ParticleField.prototype.resize = function () {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.mode !== 'drift') {
      this.targets = this.sampleThankYou();
      this.assignTargets();
    }
  };

  ParticleField.prototype.onScroll = function () {
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  };

  ParticleField.prototype.countForViewport = function () {
    var base = Math.floor(this.w / 14);
    return clamp(base, 52, this.w < 700 ? 72 : 96);
  };

  ParticleField.prototype.spawn = function () {
    var n = this.countForViewport();
    this.particles = [];
    for (var i = 0; i < n; i++) {
      this.particles.push(this.makeParticle(true));
    }
  };

  ParticleField.prototype.makeParticle = function (anywhere) {
    var typeRoll = Math.random();
    var type = typeRoll < 0.55 ? 'ember' : typeRoll < 0.85 ? 'bokeh' : 'star';
    var depth = Math.random();

    var x;
    var y;
    if (anywhere) {
      // Bias spawn toward top & upper corners
      var corner = Math.random();
      if (corner < 0.45) {
        x = Math.random() * this.w;
        y = Math.random() * this.h * 0.45;
      } else if (corner < 0.7) {
        x = Math.random() * this.w * 0.28;
        y = Math.random() * this.h * 0.55;
      } else if (corner < 0.95) {
        x = this.w * 0.72 + Math.random() * this.w * 0.28;
        y = Math.random() * this.h * 0.55;
      } else {
        x = Math.random() * this.w;
        y = Math.random() * this.h;
      }
    } else {
      x = Math.random() * this.w;
      y = -20 - Math.random() * 80;
    }

    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.18,
      vy: 0.12 + Math.random() * 0.28,
      size:
        type === 'bokeh'
          ? 3.5 + Math.random() * 5.5
          : type === 'star'
            ? 1.2 + Math.random() * 1.8
            : 1.4 + Math.random() * 2.4,
      opacity: type === 'bokeh' ? 0.08 + Math.random() * 0.14 : 0.18 + Math.random() * 0.42,
      type: type,
      depth: depth,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      angle: Math.random() * Math.PI * 2,
      homeOx: (Math.random() - 0.5) * 18,
      homeOy: (Math.random() - 0.5) * 12,
      tx: null,
      ty: null,
      release: false,
      glow: 0
    };
  };

  ParticleField.prototype.sampleThankYou = function () {
    if (!this.stage) return [];

    var rect = this.stage.getBoundingClientRect();
    var tw = Math.max(280, Math.floor(rect.width));
    var th = Math.max(120, Math.floor(rect.height));

    var off = document.createElement('canvas');
    off.width = tw;
    off.height = th;
    var octx = off.getContext('2d');
    octx.clearRect(0, 0, tw, th);
    octx.fillStyle = '#ffffff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';

    var fontSize = Math.floor(clamp(tw * 0.16, 36, 72));
    octx.font = '500 ' + fontSize + 'px "Cormorant Garamond", Georgia, serif';
    octx.letterSpacing = '0.18em';

    // Prefer two-line on narrow screens
    if (tw < 420) {
      var lineH = fontSize * 1.15;
      octx.fillText('THANK', tw / 2, th / 2 - lineH * 0.45);
      octx.fillText('YOU', tw / 2, th / 2 + lineH * 0.55);
    } else {
      octx.fillText('THANK YOU', tw / 2, th / 2);
    }

    var data = octx.getImageData(0, 0, tw, th).data;
    var step = tw < 500 ? 5 : 4;
    var points = [];

    for (var y = 0; y < th; y += step) {
      for (var x = 0; x < tw; x += step) {
        if (data[(y * tw + x) * 4 + 3] > 140) {
          // Jitter so letters feel organic, not a rigid grid
          points.push({
            x: rect.left + x + (Math.random() - 0.5) * 1.5,
            y: rect.top + y + (Math.random() - 0.5) * 1.5
          });
        }
      }
    }

    // Shuffle
    for (var i = points.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = points[i];
      points[i] = points[j];
      points[j] = tmp;
    }

    return points;
  };

  ParticleField.prototype.assignTargets = function () {
    var pts = this.targets;
    if (!pts.length) return;

    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      var t = pts[i % pts.length];
      p.tx = t.x;
      p.ty = t.y;
      p.release = i % 9 === 0; // a few will float away after settle
    }
  };

  ParticleField.prototype.beginGather = function () {
    if (this.formed) return;
    if (this.mode !== 'drift') return;
    if (reduced.matches) {
      if (this.section) this.section.classList.add('is-formed', 'is-settled');
      this.formed = true;
      return;
    }

    this.targets = this.sampleThankYou();
    this.assignTargets();
    // Skip the long cloud phase — fly straight toward the letters
    this.mode = 'form';
    this.modeT = 0;
    this.glowSweep = -0.25;
    if (this.section) this.section.classList.remove('is-formed', 'is-settled');
  };

  ParticleField.prototype.tick = function (ts) {
    var dt = this.lastTs ? Math.min(32, ts - this.lastTs) / 16.67 : 1;
    this.lastTs = ts;

    var scrollDelta = this.scrollY - this.lastScrollY;
    this.lastScrollY = this.scrollY;

    this.update(dt, scrollDelta);
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  ParticleField.prototype.update = function (dt, scrollDelta) {
    if (reduced.matches) return;

    this.modeT += dt * 0.016;

    // Fast timeline: form (~0.9s) → settle (~0.5s) → release
    if (this.mode === 'form' && this.modeT > 0.9) {
      this.mode = 'settle';
      this.modeT = 0;
      this.formed = true;
      if (this.section) this.section.classList.add('is-formed');
    } else if (this.mode === 'settle' && this.modeT > 0.5) {
      this.mode = 'release';
      this.modeT = 0;
      if (this.section) this.section.classList.add('is-settled');
    }

    if (this.mode === 'settle' || this.mode === 'release') {
      this.glowSweep += 0.018 * dt;
      if (this.glowSweep > 1.4) this.glowSweep = -0.2;
    }

    if (this.mode === 'form' || this.mode === 'settle') {
      if (Math.floor(this.modeT * 6) % 2 === 0) {
        this.nudgeTargetsToStage();
      }
    }

    var cx = this.w * 0.5;
    var cy = this.h * 0.48;
    if (this.stage) {
      var r = this.stage.getBoundingClientRect();
      cx = r.left + r.width * 0.5;
      cy = r.top + r.height * 0.5;
    }

    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      p.phase += 0.01 * dt;
      p.angle += p.spin * dt;

      // Scroll parallax — particles travel with the page at layered speeds
      if (this.mode === 'drift') {
        p.y -= scrollDelta * (0.25 + p.depth * 0.55);
      } else {
        p.y -= scrollDelta * (0.08 + p.depth * 0.12);
      }

      if (this.mode === 'drift') {
        p.x += p.vx * dt + Math.sin(p.phase) * 0.15 * dt;
        p.y += p.vy * dt + Math.cos(p.phase * 0.7) * 0.08 * dt;

        // Soft cross-drift
        p.x += Math.sin(p.phase * 0.4 + p.depth) * 0.12 * dt;

        if (p.y > this.h + 30) {
          p.y = -20 - Math.random() * 40;
          p.x = Math.random() * this.w;
        }
        if (p.y < -40) {
          p.y = this.h + 20;
          p.x = Math.random() * this.w;
        }
        if (p.x < -30) p.x = this.w + 20;
        if (p.x > this.w + 30) p.x = -20;
      } else if (this.mode === 'gather') {
        // Brief cloud (rarely used — we jump straight to form)
        var gx = cx + p.homeOx * 3;
        var gy = cy + p.homeOy * 2.5;
        var ease = 0.06 + p.depth * 0.04;
        p.x = lerp(p.x, gx, ease * dt);
        p.y = lerp(p.y, gy, ease * dt);
        p.opacity = lerp(p.opacity, 0.4 + p.depth * 0.25, 0.08 * dt);
      } else if (this.mode === 'form' || this.mode === 'settle') {
        if (p.tx != null) {
          var tEase = this.mode === 'form' ? 0.12 + p.depth * 0.06 : 0.18;
          p.x = lerp(p.x, p.tx, tEase * dt);
          p.y = lerp(p.y, p.ty, tEase * dt);
          p.x += Math.sin(p.phase * 2) * 0.1 * dt;
          p.y += Math.cos(p.phase * 2) * 0.1 * dt;
          p.opacity = lerp(p.opacity, 0.6 + p.depth * 0.3, 0.1 * dt);
          p.glow = lerp(p.glow, this.mode === 'settle' ? 1 : 0.5, 0.1 * dt);
        }
      } else if (this.mode === 'release') {
        if (p.release) {
          p.vy = -0.35 - p.depth * 0.25;
          p.vx += (Math.random() - 0.5) * 0.02;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.opacity = Math.max(0, p.opacity - 0.004 * dt);
        } else if (p.tx != null) {
          p.x = lerp(p.x, p.tx + Math.sin(p.phase) * 0.8, 0.06 * dt);
          p.y = lerp(p.y, p.ty + Math.cos(p.phase) * 0.6, 0.06 * dt);
          p.glow = 0.55 + Math.sin(p.phase * 3) * 0.2;
        }
      }
    }
  };

  ParticleField.prototype.nudgeTargetsToStage = function () {
    // Re-map by regenerating if stage moved a lot (e.g. address bar)
    if (!this.stage || !this.targets.length) return;
    var rect = this.stage.getBoundingClientRect();
    var first = this.targets[0];
    if (!first) return;
    // If stage jumped more than 40px, resample
    var midY = 0;
    for (var i = 0; i < Math.min(20, this.targets.length); i++) midY += this.targets[i].y;
    midY /= Math.min(20, this.targets.length);
    if (Math.abs(midY - (rect.top + rect.height / 2)) > 48) {
      this.targets = this.sampleThankYou();
      this.assignTargets();
    }
  };

  ParticleField.prototype.draw = function () {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    if (reduced.matches) return;

    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      if (p.opacity <= 0.01) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = clamp(p.opacity, 0, 0.85);

      if (p.type === 'bokeh') {
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        g.addColorStop(0, 'rgba(245, 230, 190, 0.55)');
        g.addColorStop(0.45, 'rgba(197, 160, 89, 0.18)');
        g.addColorStop(1, 'rgba(197, 160, 89, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = 'rgba(232, 210, 150, 0.9)';
        ctx.shadowBlur = 6 + p.glow * 8;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.55)';
        this.drawStar(ctx, p.size);
      } else {
        ctx.fillStyle = 'rgba(212, 175, 105, 0.95)';
        ctx.shadowBlur = 8 + p.glow * 10;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.65)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Soft golden sweep across formed text
    if ((this.mode === 'settle' || this.mode === 'release') && this.stage) {
      var rect = this.stage.getBoundingClientRect();
      var sweepX = rect.left + rect.width * this.glowSweep;
      var grad = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, 0);
      grad.addColorStop(0, 'rgba(255, 240, 200, 0)');
      grad.addColorStop(0.5, 'rgba(255, 236, 180, 0.12)');
      grad.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(rect.left - 20, rect.top - 10, rect.width + 40, rect.height + 20);
    }
  };

  ParticleField.prototype.drawStar = function (ctx, size) {
    var s = size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.25, -s * 0.25);
    ctx.lineTo(s, 0);
    ctx.lineTo(s * 0.25, s * 0.25);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.25, s * 0.25);
    ctx.lineTo(-s, 0);
    ctx.lineTo(-s * 0.25, -s * 0.25);
    ctx.closePath();
    ctx.fill();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    if (reduced.matches) {
      var section = document.getElementById('page-thank-you');
      if (section) section.classList.add('is-formed', 'is-settled');
      return;
    }

    window.particleField = new ParticleField(canvas);
  });
})();
