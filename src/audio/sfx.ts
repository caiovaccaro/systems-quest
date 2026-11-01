/** Small synthesized effects. No audio files. Browsers stay silent until a gesture. */
export class Sfx {
  private ctx: AudioContext | null = null;
  private lastDrop = 0;

  unlock(): void {
    const ctx = this.context();
    if (ctx.state === "suspended") void ctx.resume();
  }

  tick(): void {
    this.blip(660, 0.04, 0.04);
  }

  lift(): void {
    this.blip(420, 0.07, 0.05, 180);
  }

  drop(): void {
    const now = performance.now();
    if (now - this.lastDrop < 50) return;
    this.lastDrop = now;
    const ctx = this.context();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
    this.noise(0.08, 0.08);
  }

  plug(): void {
    this.blip(520, 0.05, 0.06);
    this.blip(780, 0.06, 0.05, 70);
  }

  unplug(): void {
    this.blip(340, 0.08, 0.05, -80);
  }

  no(): void {
    this.blip(140, 0.12, 0.05);
  }

  win(): void {
    [523, 659, 784, 1046].forEach((freq, i) => this.blip(freq, 0.12, 0.06, i * 90));
  }

  private context(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private blip(freq: number, dur: number, vol: number, delayMs = 0): void {
    const ctx = this.context();
    const t = ctx.currentTime + delayMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number): void {
    const ctx = this.context();
    const length = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }
}

export const sfx = new Sfx();
