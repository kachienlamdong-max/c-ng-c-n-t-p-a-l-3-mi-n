/**
 * Web Audio API synthesizer for interactive geography app.
 * Provides authentic explosion, fireworks, chime, and UI interaction sound effects
 * without relying on external media files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Sound on selecting or picking up a card
   */
  public playCardPick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * INCORRECT DROP: Explosion "BÙM" sound + spring bounce-back effect
   */
  public playExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Deep Sub-Bass Explosion Thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // 2. White Noise Blast (Explosion Crash)
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.4);

    // 3. Comical Rebound Boing (card bouncing back to deck)
    const boingOsc = this.ctx.createOscillator();
    const boingGain = this.ctx.createGain();

    boingOsc.type = 'triangle';
    const boingStart = now + 0.22;
    boingOsc.frequency.setValueAtTime(220, boingStart);
    boingOsc.frequency.linearRampToValueAtTime(110, boingStart + 0.15);
    boingOsc.frequency.linearRampToValueAtTime(280, boingStart + 0.28);
    boingOsc.frequency.linearRampToValueAtTime(140, boingStart + 0.42);

    boingGain.gain.setValueAtTime(0, boingStart);
    boingGain.gain.linearRampToValueAtTime(0.35, boingStart + 0.05);
    boingGain.gain.exponentialRampToValueAtTime(0.001, boingStart + 0.45);

    boingOsc.connect(boingGain);
    boingGain.connect(this.masterGain);

    boingOsc.start(boingStart);
    boingOsc.stop(boingStart + 0.45);
  }

  /**
   * CORRECT DROP: Fireworks crackle + Joyful celebratory melodic chime
   */
  public playCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Firework pop & crackle particles
    const popTimes = [0, 0.06, 0.13, 0.2];
    popTimes.forEach((delay) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + delay;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();

      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(600 + Math.random() * 400, t);
      popOsc.frequency.exponentialRampToValueAtTime(150, t + 0.07);

      popGain.gain.setValueAtTime(0.3, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);
      popOsc.start(t);
      popOsc.stop(t + 0.07);
    });

    // 2. Sparkling crackle noise
    const crackleLength = this.ctx.sampleRate * 0.35;
    const crackleBuffer = this.ctx.createBuffer(1, crackleLength, this.ctx.sampleRate);
    const cData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < crackleLength; i++) {
      if (Math.random() > 0.88) {
        cData[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        cData[i] = 0;
      }
    }
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 2500;
    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.25, now);
    crackleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    crackleSource.start(now);
    crackleSource.stop(now + 0.35);

    // 3. Cheerful ascending melody: C5, E5, G5, C6 (Bright Celesta bell chime)
    const notes = [
      { freq: 523.25, time: 0.05 }, // C5
      { freq: 659.25, time: 0.12 }, // E5
      { freq: 783.99, time: 0.19 }, // G5
      { freq: 1046.50, time: 0.28 }, // C6
      { freq: 1318.51, time: 0.38 }, // E6
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + note.time;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, t);

      // Bell envelope
      oscGain.gain.setValueAtTime(0.25, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * Complete Game Victory Fanfare
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chords = [
      { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.25 },     // C major
      { freqs: [587.33, 739.99, 880.00], time: 0.25, dur: 0.25 },  // D major
      { freqs: [659.25, 830.61, 987.77], time: 0.5, dur: 0.3 },   // E major
      { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.85, dur: 0.8 }, // G/C glorious
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + chord.time);

        gain.gain.setValueAtTime(0.18, now + chord.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + chord.time);
        osc.stop(now + chord.time + chord.dur);
      });
    });
  }
}

export const soundEngine = new SoundEngine();
