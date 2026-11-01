interface Sample {
  t: number;
  ms: number;
  ok: boolean;
}

export class Metrics {
  private samples: Sample[] = [];
  private readonly window = 6;

  push(t: number, ms: number, ok: boolean): void {
    this.samples.push({ t, ms, ok });
    this.prune(t);
  }

  prune(t: number): void {
    const cut = t - this.window;
    while (this.samples.length && this.samples[0]!.t < cut) {
      this.samples.shift();
    }
  }

  get rps(): number {
    return this.samples.length / this.window;
  }

  get errorRate(): number {
    if (this.samples.length === 0) return 0;
    let bad = 0;
    for (const s of this.samples) if (!s.ok) bad += 1;
    return bad / this.samples.length;
  }

  percentile(p: number): number {
    const ok = this.samples.filter((s) => s.ok).map((s) => s.ms);
    if (ok.length === 0) return 0;
    ok.sort((a, b) => a - b);
    const i = Math.min(ok.length - 1, Math.floor(p * (ok.length - 1)));
    return ok[i]!;
  }

  get p50(): number {
    return this.percentile(0.5);
  }

  get p99(): number {
    return this.percentile(0.99);
  }
}
