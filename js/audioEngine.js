/* -----------------------------------------------------------------
   SINI & MARTIN — Background Music Player
   Plays assets/audio/bgm.mp3. Exposes window.soundscape with
   play() / pause() / togglePlay() for the floating control button
   and for the cover "Tap Here" handoff in main.js.
   ----------------------------------------------------------------- */

(function () {
  'use strict';

  var TRACK = 'assets/audio/bgm.mp3';

  function SoundscapeEngine() {
    this.audio = new Audio(TRACK);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0.55;

    this.isPlaying = false;
    this.toggleBtn = document.getElementById('audio-toggle-btn');
    this.labelEl = this.toggleBtn
      ? this.toggleBtn.querySelector('.audio-text')
      : null;

    this.bindEvents();
    this.syncUI(false);
  }

  SoundscapeEngine.prototype.bindEvents = function () {
    var self = this;

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.togglePlay();
      });
    }

    this.audio.addEventListener('play', function () {
      self.isPlaying = true;
      self.syncUI(true);
    });

    this.audio.addEventListener('pause', function () {
      self.isPlaying = false;
      self.syncUI(false);
    });

    this.audio.addEventListener('ended', function () {
      // loop=true normally prevents this; keep UI honest if it fires
      self.isPlaying = false;
      self.syncUI(false);
    });
  };

  SoundscapeEngine.prototype.syncUI = function (playing) {
    if (!this.toggleBtn) return;

    this.toggleBtn.classList.toggle('playing', playing);
    this.toggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    this.toggleBtn.setAttribute(
      'aria-label',
      playing ? 'Pause music' : 'Play music'
    );
    this.toggleBtn.setAttribute(
      'title',
      playing ? 'Pause music' : 'Play music'
    );

    if (this.labelEl) {
      this.labelEl.textContent = playing ? 'Pause' : 'Music';
    }
  };

  SoundscapeEngine.prototype.play = function () {
    var self = this;
    var result = this.audio.play();

    if (result && typeof result.then === 'function') {
      result
        .then(function () {
          self.isPlaying = true;
          self.syncUI(true);
        })
        .catch(function () {
          // Autoplay blocked until a later user gesture — UI stays "Music"
          self.isPlaying = false;
          self.syncUI(false);
        });
    } else {
      this.isPlaying = true;
      this.syncUI(true);
    }
  };

  SoundscapeEngine.prototype.pause = function () {
    this.audio.pause();
    this.isPlaying = false;
    this.syncUI(false);
  };

  SoundscapeEngine.prototype.togglePlay = function () {
    if (this.isPlaying && !this.audio.paused) {
      this.pause();
    } else {
      this.play();
    }
  };

  window.soundscape = new SoundscapeEngine();
})();
