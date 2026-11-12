/**
 * A tiny damped spring for a few numbers at once (x, y, rotation…).
 * Semi-implicit Euler at a fixed 1/120 s step: stable and frame-rate independent.
 */
export type SpringConfig = { stiffness: number; damping: number; mass: number };

export class Spring<K extends string> {
  value: Record<K, number>;
  private velocity: Record<K, number>;
  private target: Record<K, number>;
  private raf = 0;
  private last = 0;
  private keys: K[];

  constructor(
    initial: Record<K, number>,
    private config: SpringConfig,
    private onUpdate: (v: Record<K, number>) => void,
  ) {
    this.keys = Object.keys(initial) as K[];
    this.value = { ...initial };
    this.target = { ...initial };
    this.velocity = Object.fromEntries(this.keys.map((k) => [k, 0])) as Record<K, number>;
  }

  to(target: Partial<Record<K, number>>) {
    Object.assign(this.target, target);
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number) => {
    const { stiffness, damping, mass } = this.config;
    let dt = Math.min((now - this.last) / 1000, 0.064);
    this.last = now;
    const step = 1 / 120;
    while (dt > 0) {
      const h = Math.min(step, dt);
      for (const k of this.keys) {
        const force = -stiffness * (this.value[k] - this.target[k]) - damping * this.velocity[k];
        this.velocity[k] += (force / mass) * h;
        this.value[k] += this.velocity[k] * h;
      }
      dt -= h;
    }
    const settled = this.keys.every(
      (k) => Math.abs(this.value[k] - this.target[k]) < 0.05 && Math.abs(this.velocity[k]) < 0.05,
    );
    if (settled) {
      for (const k of this.keys) {
        this.value[k] = this.target[k];
        this.velocity[k] = 0;
      }
      this.raf = 0;
    } else {
      this.raf = requestAnimationFrame(this.tick);
    }
    this.onUpdate(this.value);
  };
}
