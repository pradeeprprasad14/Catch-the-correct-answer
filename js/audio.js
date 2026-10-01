/* =========================================================
   RETRO ARCADE DROP - SYNTHESIZED 8-BIT AUDIO ENGINE
   Procedural Sound Effects & Chiptune Arpeggios (Web Audio API)
========================================================= */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.tempo = 130; // BPM
    this.step = 0;

    // Chiptune scales and melody patterns (Pentatonic / Arcade vibe)
    this.bassPattern = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83]; // A2, C3, D3, E3...
    this.leadPattern = [440, 523.25, 659.25, 587.33, 783.99, 659.25, 523.25, 440];
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  playCoin() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Classic 2-tone arcade coin jump: B5 to E6
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playError() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Low harsh buzz drop
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(65, t + 0.28);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.31);
  }

  playDash() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playPowerup() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C, E, G, C, E, G
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.16);
    });
  }

  playExplosion() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    // Noise buffer generator for arcade explosion
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playLevelUp() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.26);
    });
  }

  playGameOver() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [587.33, 523.25, 493.88, 440, 392, 349.23, 311.13];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  }

  // --- Chiptune Procedural Background Music ---

  setBGMTempo(stage) {
    // Speed up chiptune as stage progresses
    this.tempo = Math.min(180, 120 + stage * 5);
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.musicEnabled;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  startBGM() {
    if (!this.musicEnabled || this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.scheduleNextBGMStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleNextBGMStep() {
    if (!this.bgmPlaying || !this.musicEnabled || !this.ctx) return;

    const stepInterval = (60 / this.tempo) / 2; // Eighth note in seconds
    const t = this.ctx.currentTime;

    // Bass Note
    const bassIdx = Math.floor(this.step / 2) % this.bassPattern.length;
    if (this.step % 2 === 0) {
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(this.bassPattern[bassIdx], t);
      bGain.gain.setValueAtTime(0.12, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + stepInterval * 1.8);
      bOsc.connect(bGain);
      bGain.connect(this.ctx.destination);
      bOsc.start(t);
      bOsc.stop(t + stepInterval * 1.8);
    }

    // Lead Arpeggio Note
    const leadIdx = this.step % this.leadPattern.length;
    const lOsc = this.ctx.createOscillator();
    const lGain = this.ctx.createGain();
    lOsc.type = 'square';
    lOsc.frequency.setValueAtTime(this.leadPattern[leadIdx], t);
    lGain.gain.setValueAtTime(0.04, t);
    lGain.gain.exponentialRampToValueAtTime(0.001, t + stepInterval * 0.85);
    lOsc.connect(lGain);
    lGain.connect(this.ctx.destination);
    lOsc.start(t);
    lOsc.stop(t + stepInterval * 0.9);

    this.step = (this.step + 1) % 64;

    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBGMStep();
    }, stepInterval * 1000);
  }
}

window.soundEngine = new SoundEngine();
