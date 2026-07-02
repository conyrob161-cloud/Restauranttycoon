export default class VirtualJoystick {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.radius = config.input.joystickRadius;
    this.deadZone = config.input.joystickDeadZone;
    this.active = false;
    this.pointerId = null;
    this.center = new pc.Vec2(0, 0);
    this.value = new pc.Vec2(0, 0);
    this.runHeld = false;
    this.interactQueue = false;

    this.createUI();
  }

  createUI() {
    this.layer = document.createElement('div');
    this.layer.className = 'rt-ui-layer';

    this.el = document.createElement('div');
    this.el.className = 'rt-joystick';

    this.stick = document.createElement('div');
    this.stick.className = 'stick';
    this.el.appendChild(this.stick);

    this.button = document.createElement('button');
    this.button.className = 'rt-action-button';
    this.button.textContent = 'ACT';

    this.debug = document.createElement('div');
    this.debug.className = 'rt-debug';
    this.debug.style.display = 'none';

    this.layer.appendChild(this.el);
    this.layer.appendChild(this.button);
    this.layer.appendChild(this.debug);
    document.body.appendChild(this.layer);

    this.bindEvents();
  }

  bindEvents() {
    this.el.addEventListener('pointerdown', this.onDown.bind(this));
    this.el.addEventListener('pointermove', this.onMove.bind(this));
    this.el.addEventListener('pointerup', this.onUp.bind(this));
    this.el.addEventListener('pointercancel', this.onUp.bind(this));

    this.button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.interactQueue = true;
    });
  }

  getLocalPosition(event) {
    const rect = this.el.getBoundingClientRect();
    return new pc.Vec2(event.clientX - rect.left, event.clientY - rect.top);
  }

  onDown(event) {
    event.preventDefault();
    if (this.active) return;
    this.active = true;
    this.pointerId = event.pointerId;
    const rect = this.el.getBoundingClientRect();
    this.center.set(rect.width / 2, rect.height / 2);
    this.onMove(event);
  }

  onMove(event) {
    if (!this.active || event.pointerId !== this.pointerId) return;
    event.preventDefault();
    const local = this.getLocalPosition(event);
    const delta = local.sub(this.center, new pc.Vec2());
    const len = delta.length();
    const max = this.radius;
    const limited = len > max ? delta.normalize().scale(max, delta) : delta;
    const nx = limited.x / max;
    const ny = -limited.y / max;
    const output = new pc.Vec2(nx, ny);
    if (output.length() < this.deadZone) {
      output.set(0, 0);
    }
    this.value.copy(output);
    this.stick.style.transform = `translate(${limited.x}px, ${limited.y}px)`;
  }

  onUp(event) {
    if (!this.active || event.pointerId !== this.pointerId) return;
    event.preventDefault();
    this.active = false;
    this.pointerId = null;
    this.value.set(0, 0);
    this.stick.style.transform = 'translate(0px, 0px)';
  }

  getMove() {
    return this.value.clone();
  }

  isRunPressed() {
    return this.runHeld;
  }

  consumeInteract() {
    if (!this.interactQueue) return false;
    this.interactQueue = false;
    return true;
  }
}
