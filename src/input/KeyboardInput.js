export default class KeyboardInput {
  constructor(app) {
    this.app = app;
    this.keys = new Set();
    this.pauseLatch = false;
    this.interactLatch = false;
    this.dropLatch = false;

    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code);
      if (event.code === 'Space') this.interactLatch = true;
      if (event.code === 'KeyQ') this.dropLatch = true;
      if (event.code === 'Escape') this.pauseLatch = true;
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });
  }

  getMove() {
    const x = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const y = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const move = new pc.Vec2(x, y);
    if (move.lengthSq() > 1) move.normalize();
    return move;
  }

  isRunPressed() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  isInteractPressed() {
    return this.interactLatch ? (this.interactLatch = false, true) : false;
  }

  isDropPressed() {
    return this.dropLatch ? (this.dropLatch = false, true) : false;
  }

  consumePause() {
    return this.pauseLatch ? (this.pauseLatch = false, true) : false;
  }
}
