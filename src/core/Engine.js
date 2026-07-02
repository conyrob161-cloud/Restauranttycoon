import Config from './Config.js';
import Time from './Time.js';
import EventBus from './EventBus.js';
import SceneBuilder from '../scene/SceneBuilder.js';
import InputManager from '../input/InputManager.js';
import CameraController from '../camera/CameraController.js';
import CollisionWorld from '../physics/CollisionWorld.js';
import NavigationSystem from '../navigation/NavigationSystem.js';
import InteractionManager from '../interaction/InteractionManager.js';
import SaveManager from '../save/SaveManager.js';
import DebugOverlay from '../debug/DebugOverlay.js';
import PlayerController from '../player/PlayerController.js';
import NPCController from '../npc/NPCController.js';
import CarrySystem from '../items/CarrySystem.js';

export default class Engine {
  constructor({ canvasId = 'application' } = {}) {
    this.canvasId = canvasId;
    this.config = Config;
    this.time = new Time(this.config.simulationHz);
    this.events = new EventBus();
    this.app = null;
    this.scene = null;
    this.input = null;
    this.camera = null;
    this.physics = null;
    this.navigation = null;
    this.interactions = null;
    this.save = null;
    this.debug = null;
    this.player = null;
    this.npc = null;
    this.carry = null;
    this.running = false;
    this.fixedTick = this.fixedTick.bind(this);
    this.renderTick = this.renderTick.bind(this);
  }

  initialize() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      throw new Error(`Canvas #${this.canvasId} not found.`);
    }

    this.app = new pc.Application(canvas, {
      keyboard: new pc.Keyboard(window),
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas)
    });

    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    window.addEventListener('resize', () => this.app.resizeCanvas());

    this.scene = new SceneBuilder(this.app, this.config, this.events);
    this.physics = new CollisionWorld(this.config, this.events);
    this.navigation = new NavigationSystem(this.config, this.physics, this.events);
    this.input = new InputManager(this.config, this.app, this.events);
    this.interactions = new InteractionManager(this.events);
    this.save = new SaveManager(this.config, this.events);
    this.carry = new CarrySystem(this.events);
    this.camera = new CameraController(this.config, this.events);
    this.player = new PlayerController(this.config, this.physics, this.interactions, this.carry, this.events);
    this.npc = new NPCController(this.config, this.physics, this.navigation, this.events);
    this.debug = new DebugOverlay(this.config, this.events);

    this.scene.build();

    for (const collider of this.scene.staticBodies) {
      this.physics.register(collider.entity, collider.size, false);
    }

    for (const target of this.scene.interactables) {
      this.interactions.register(target);
    }

    this.player.spawn(this.scene.playerSpawn);
    this.camera.attach(this.scene.cameraAnchor, this.player);
    this.npc.spawn(this.scene.npcSpawn);
    this.save.attach(this.player, this.npc, this.carry, this.scene);
    this.debug.attach(this.player, this.npc, this.physics, this.navigation, this.interactions, this.save);

    const saved = this.save.load();
    if (saved) {
      this.player.restore(saved.player);
      this.npc.restore(saved.npc);
      this.carry.restore(saved.carry, this.scene);
    }

    this.events.on('game:save-request', () => this.save.save());

    this.time.begin(performance.now());
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.app.on('update', this.renderTick);
    requestAnimationFrame(this.fixedTick);
    this.app.start();
  }

  fixedTick(timestamp) {
    if (!this.running) return;
    this.time.step(timestamp);
    let fixed;
    while ((fixed = this.time.consumeFixedStep())) {
      this.input.update(fixed);
      this.player.update(fixed, this.input.state);
      this.npc.update(fixed);
      this.interactions.update(fixed, this.player);
      this.carry.update(fixed, this.player);
      this.camera.update(fixed, this.player);
      this.debug.update(fixed);
      if (this.input.state.pausePressed) {
        this.save.save();
      }
    }
    requestAnimationFrame(this.fixedTick);
  }

  renderTick(dt) {
    if (!this.running) return;
    this.player.syncVisuals(this.time.alpha);
    this.npc.syncVisuals(this.time.alpha);
    this.camera.syncVisuals(this.time.alpha);
    this.save.sync(dt);
    this.debug.render();
    this.app.renderNextFrame = true;
  }
}
