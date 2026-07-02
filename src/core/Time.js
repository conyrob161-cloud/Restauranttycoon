export default class Time {
  constructor(fixedHz = 60) {
    this.fixedDt = 1 / fixedHz;
    this.accumulator = 0;
    this.last = 0;
    this.elapsed = 0;
  }

  begin(timestamp) {
    this.last = timestamp;
  }

  step(timestamp) {
    const dt = Math.min(0.25, (timestamp - this.last) / 1000);
    this.last = timestamp;
    this.elapsed += dt;
    this.accumulator += dt;
    return dt;
  }

  consumeFixedStep() {
    if (this.accumulator >= this.fixedDt) {
      this.accumulator -= this.fixedDt;
      return this.fixedDt;
    }
    return 0;
  }

  get alpha() {
    return this.fixedDt > 0 ? this.accumulator / this.fixedDt : 0;
  }
}
