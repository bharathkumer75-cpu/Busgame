/**
 * Web Audio API Procedural Sound Engine
 * Generates realistic heavy diesel engine rumble, multi-tone Indian air horns,
 * air brake pneumatic discharge and indicator clicks with ZERO external audio files needed!
 */
class BusSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;

    // Engine oscillator nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineSub = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.turboGain = null;
    this.turboOsc = null;

    // Master volume
    this.masterGain = null;
    this.hornActive = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this._setupEngineSynth();
      this.isInitialized = true;
      console.log("Audio Engine initialized successfully.");
    } catch (e) {
      console.warn("Web Audio not supported or blocked by autoplay policy:", e);
    }
  }

  _setupEngineSynth() {
    // 1. Primary engine cylinder pulse (Sawtooth)
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = "sawtooth";
    this.engineOsc1.frequency.setValueAtTime(35, this.ctx.currentTime); // ~600 idle RPM

    // 2. Secondary harmonic oscillator (Triangle)
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = "triangle";
    this.engineOsc2.frequency.setValueAtTime(70, this.ctx.currentTime);

    // 3. Sub-bass vibration
    this.engineSub = this.ctx.createOscillator();
    this.engineSub.type = "sine";
    this.engineSub.frequency.setValueAtTime(18, this.ctx.currentTime);

    // Low-pass filter to simulate engine block acoustic dampening
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Engine gain
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    // Connect engine nodes
    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineSub.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    // 4. Turbocharger high-pitch whistle
    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = "sine";
    this.turboOsc.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.masterGain);

    // Start continuous oscillators
    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineSub.start();
    this.turboOsc.start();
  }

  updateEngine(rpmRatio, throttle) {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;

    // RPM ratio 0.0 (idle) to 1.0 (max redline)
    const baseFreq = 30 + rpmRatio * 90; // 30Hz -> 120Hz
    const now = this.ctx.currentTime;

    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.1, now, 0.05);
    this.engineSub.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

    // Filter opens up under throttle (growl of heavy diesel)
    const filterCutoff = 180 + (throttle * 380) + (rpmRatio * 200);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.05);

    // Turbocharger spools up when accelerating
    const turboFreq = 900 + (rpmRatio * 1800);
    this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.1);
    this.turboGain.gain.setTargetAtTime(throttle * 0.08, now, 0.1);
  }

  /**
   * Iconic Indian Highway Multi-Tone Musical Air Horn!
   */
  playIndianAirHorn() {
    if (!this.isInitialized || !this.ctx || this.hornActive) return;
    this.hornActive = true;

    const chords = [
      [349.23, 440.0, 523.25], // F4 major chord
      [392.00, 493.88, 587.33], // G4 chord
      [440.00, 554.37, 659.25], // A4 chord
      [523.25, 659.25, 783.99]  // High C5 fanfare blast
    ];

    let step = 0;
    const playBlast = () => {
      if (!this.hornActive) return;
      const freqs = chords[step % chords.length];
      const now = this.ctx.currentTime;

      freqs.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.2);
      });

      step++;
      if (this.hornActive && step < 8) {
        setTimeout(playBlast, 160);
      } else {
        this.hornActive = false;
      }
    };

    playBlast();
  }

  stopHorn() {
    this.hornActive = false;
  }

  /**
   * Air Brake Pneumatic Pressure Release Sound ("Psssshhhh-chk!")
   */
  playAirBrakeHiss() {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4; // 400ms hiss
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Turn Signal Relay Click
   */
  playClick() {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Passenger Boarding Chime Bell
   */
  playPassengerChime() {
    if (!this.isInitialized || !this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 880.0].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + (idx * 0.12));
      gain.gain.setValueAtTime(0.2, now + (idx * 0.12));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.12) + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + (idx * 0.12));
      osc.stop(now + (idx * 0.12) + 0.45);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

window.BusSoundEngine = BusSoundEngine;
