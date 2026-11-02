/**
 * Procedural Audio Synthesizer for Focus Sessions using Web Audio API
 * Generates soothing ambient cabin noise, highway hum, rain, and celebratory completion chimes
 * without any external audio file downloads.
 */

class FocusAudioManager {
  private ctx: AudioContext | null = null;
  private currentSourceNode: AudioNode | null = null;
  private currentGainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35; // default 35%

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.currentGainNode) {
      this.currentGainNode.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx?.currentTime || 0);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentGainNode && !this.isMuted) {
      this.currentGainNode.gain.setValueAtTime(this.volume, this.ctx?.currentTime || 0);
    }
  }

  public getVolume() {
    return this.volume;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  /**
   * Stop any playing ambient sound
   */
  public stopAmbient() {
    try {
      if (this.currentSourceNode) {
        // Disconnect or stop
        (this.currentSourceNode as AudioBufferSourceNode).stop?.();
        this.currentSourceNode.disconnect();
        this.currentSourceNode = null;
      }
      if (this.currentGainNode) {
        this.currentGainNode.disconnect();
        this.currentGainNode = null;
      }
    } catch {
      // Ignore if already stopped
    }
  }

  /**
   * Start Airplane Cabin White-Noise Hum
   */
  public playCabinHum() {
    this.stopAmbient();
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      // Brown/Pink noise for soothing cabin rumble
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Lowpass filter to emulate deep jet engine cabin sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime); // Deep hum

      // Secondary low rumble oscillator
      const rumbleOsc = this.ctx.createOscillator();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(54, this.ctx.currentTime); // 54Hz jet rumble
      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      rumbleOsc.connect(rumbleGain);

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.45, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      rumbleGain.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      noiseSource.start();
      rumbleOsc.start();

      this.currentSourceNode = noiseSource;
      this.currentGainNode = masterGain;
    } catch (e) {
      console.warn('Cabin audio failed to start:', e);
    }
  }

  /**
   * Start Highway Road Breeze Hum
   */
  public playHighwayHum() {
    this.stopAmbient();
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      // Pinkish wind noise
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.03 * white)) / 1.03;
        lastOut = data[i];
        data[i] *= 2.8;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Bandpass filter to sound like highway asphalt breeze
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.4, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      noiseSource.start();
      this.currentSourceNode = noiseSource;
      this.currentGainNode = masterGain;
    } catch (e) {
      console.warn('Road audio failed to start:', e);
    }
  }

  /**
   * Start Gentle Zen Rain
   */
  public playZenRain() {
    this.stopAmbient();
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, this.ctx.currentTime);

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      noiseSource.start();
      this.currentSourceNode = noiseSource;
      this.currentGainNode = masterGain;
    } catch (e) {
      console.warn('Zen audio failed to start:', e);
    }
  }

  /**
   * Play Flight Arrival Ding-Dong / Victory Bell Chime
   */
  public playArrivalChime() {
    try {
      this.initContext();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;

      // Note 1: High chime (e.g. F#5 ~ 740 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(740, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.3);

      // Note 2: Lower ding chime (e.g. C#5 ~ 554 Hz) played 0.28s later
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, now + 0.28);

      gain2.gain.setValueAtTime(0, now + 0.28);
      gain2.gain.linearRampToValueAtTime(0.45, now + 0.33);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 2.1);
    } catch (e) {
      console.warn('Arrival chime failed:', e);
    }
  }
}

export const focusAudio = new FocusAudioManager();
