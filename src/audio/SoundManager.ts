// Web Audio API Procedural Synthesizer & Dynamic Audio Engine
// Generates authentic dark fantasy combat, wraith magic, orc taunts, and adaptive ambient music

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private inCombat: boolean = false;
  private musicInterval: number | null = null;
  private beatStep: number = 0;

  constructor() {
    // Initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.55;
      this.sfxGain.connect(this.ctx.destination);

      this.startAmbientMusic();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureAudio() {
    this.initContext();
  }

  public setInCombat(combat: boolean) {
    this.inCombat = combat;
  }

  // --- SFX GENERATORS ---

  // Sword Slash
  public playSlash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Heavy Hit / Flesh Impact
  public playImpact() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Perfect Parry / Counter Clang
  public playParry() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Bell/Metal Ring
    [880, 1760, 2640, 3520].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), t);

      const decay = 0.45 / (i * 0.4 + 1);
      gain.gain.setValueAtTime(0.3 / (i + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // Bow Shoot
  public playBowShoot() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Wraith Power / Drain / Brand Chime
  public playWraithChime() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Ethereal chord
    [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.8);
    });
  }

  // Shadow Strike Teleport Whoosh
  public playShadowStrike() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.35);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  // Brutal Execution Climax
  public playExecution() {
    this.playImpact();
    this.playSlash();
    this.playWraithChime();
  }

  // Orc War Horn (Captain Encounter)
  public playWarHorn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(200, t + 0.3);
    osc.frequency.setValueAtTime(200, t + 0.9);
    osc.frequency.exponentialRampToValueAtTime(140, t + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(950, t + 0.3);
    filter.frequency.exponentialRampToValueAtTime(300, t + 1.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.25);
    gain.gain.setValueAtTime(0.5, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.8);
  }

  // Orc Voice Grunt / Roar
  public playOrcGrunt(pitchMod: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110 * pitchMod, t);
    osc.frequency.linearRampToValueAtTime(75 * pitchMod, t + 0.22);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Level Up / Loot Drop Fanfare
  public playFanfare() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((note, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  // --- ADAPTIVE MUSIC GENERATOR (Mordor Dark Fantasy) ---
  private startAmbientMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    // Dark ambient loop with rhythmic war drums
    const tempo = 120;
    const intervalMs = (60 / tempo) * 500; // eighth notes

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      this.beatStep = (this.beatStep + 1) % 32;

      // Low ominous drone (roots: D, F, G, A#)
      if (this.beatStep % 8 === 0) {
        const droneFrequencies = [73.42, 87.31, 98.0, 116.54]; // D2, F2, G2, Bb2
        const freq = droneFrequencies[Math.floor((this.beatStep / 8) % droneFrequencies.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(t);
        osc.stop(t + 2.2);
      }

      // War drums during combat or tense exploration
      if (this.inCombat || this.beatStep % 4 === 0) {
        const isAccent = this.beatStep % 8 === 0;
        const drumOsc = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();

        drumOsc.type = 'triangle';
        drumOsc.frequency.setValueAtTime(isAccent ? 90 : 65, t);
        drumOsc.frequency.exponentialRampToValueAtTime(30, t + (isAccent ? 0.18 : 0.1));

        const volume = this.inCombat ? (isAccent ? 0.45 : 0.25) : 0.15;
        drumGain.gain.setValueAtTime(volume, t);
        drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        drumOsc.connect(drumGain);
        drumGain.connect(this.musicGain);

        drumOsc.start(t);
        drumOsc.stop(t + 0.2);
      }

      // Tension chimes / wraith whispers
      if (!this.inCombat && this.beatStep % 16 === 12) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(587.33, t); // D5
        chimeGain.gain.setValueAtTime(0.08, t);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        chime.connect(chimeGain);
        chimeGain.connect(this.musicGain);
        chime.start(t);
        chime.stop(t + 1.2);
      }
    }, intervalMs);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicGain && this.sfxGain && this.ctx) {
      const target = this.isMuted ? 0 : 1;
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.55, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
